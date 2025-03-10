import { BASIS_POINTS_DIVISOR, FUNDING_RATE_PRECISION, LEVERAGE_LIQUIDAITON, MARGIN_FEE_BASIS_POINTS, MAX_LEVERAGE } from "./constant"
import { IAccountSummary, ITrade, IClaim, IClaimSource, IPositionClose, IPositionLiquidated, IAbstractPositionStake, ITradeSettled, ITradeClosed, ITradeLiquidated, ITradeOpen, TradeStatus, TokenDescription } from "./types"
import { formatFixed, getDenominator, groupByMapMany, isAddress } from "./utils"



export function getPositionCumulativeFundingFee(size: bigint, fundingRate: bigint) {
  return size * fundingRate / FUNDING_RATE_PRECISION
}

export function getMarginFees(size: bigint) {
  return size * MARGIN_FEE_BASIS_POINTS / BASIS_POINTS_DIVISOR
}


export function div(a: bigint, b: bigint): bigint {
  if (b === 0n) {
    return 0n
  }

  return a * BASIS_POINTS_DIVISOR / b
}

export function bnDiv(a: bigint, b: bigint): number {
  return formatFixed(div(a, b), 4)
}

export function formatToBasis(a: bigint): number {
  return formatFixed(a, 4)
}


export function getLeverageChange(
  size: bigint,
  sizeDelta: bigint,
  increaseSize: bigint,
  collateral: bigint,
  collateralDelta: bigint,
  increaseCollateral: bigint,
  entryFundingRate: bigint,
  cumulativeFundingRate: bigint
): bigint {

  let nextSize = size ? size : 0n

  if (sizeDelta) {
    if (increaseSize) {
      nextSize = size + sizeDelta
    } else {
      if (sizeDelta >= size) {
        return 0n
      }
      nextSize = size - sizeDelta
    }
  }

  let remainingCollateral = collateral ? collateral : 0n

  if (collateralDelta) {
    if (increaseCollateral) {
      remainingCollateral = collateral + collateralDelta
    } else {
      if (collateralDelta >= collateral) {
        return 0n
      }
      remainingCollateral = collateral - collateralDelta
    }
  }



  remainingCollateral = sizeDelta
    ? remainingCollateral * (BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS) / BASIS_POINTS_DIVISOR
    : remainingCollateral

  if (entryFundingRate && cumulativeFundingRate) {
    const fundingFee = size * (cumulativeFundingRate - entryFundingRate) / FUNDING_RATE_PRECISION
    remainingCollateral = remainingCollateral - fundingFee
  }

  return nextSize * BASIS_POINTS_DIVISOR / remainingCollateral
}



export function getDelta(positionPrice: bigint, price: bigint, size: bigint) {
  const priceDelta = price - positionPrice

  return size * priceDelta / positionPrice
}

export function getDeltaPercentage(delta: bigint, collateral: bigint) {
  return delta * BASIS_POINTS_DIVISOR / collateral
}

export function getAveragePriceFromDelta(pnl: bigint, size: bigint, markPrice: bigint, sizeDelta: bigint) {
  const nextSize = size + sizeDelta
  const divisor = nextSize + pnl

  return markPrice * nextSize / divisor
}


export function getTokenAmount(amountUsd: bigint, price: bigint, tokenDescription: TokenDescription) {
  return amountUsd * getDenominator(tokenDescription.decimals) / price
}

export function getTokenUsd(amount: bigint, price: bigint, decimals: number) {
  return amount * price / getDenominator(decimals)
}

export function getLiquidationPrice(collateral: bigint, size: bigint, averagePrice: bigint, isLong: boolean) {
  const liquidationAmount = size * BASIS_POINTS_DIVISOR / LEVERAGE_LIQUIDAITON
  const liquidationDelta = collateral - liquidationAmount
  const priceDelta = liquidationDelta * averagePrice / size

  return isLong ? averagePrice - priceDelta : averagePrice + priceDelta
}

export function getLiquidationPriceFromDelta(isLong: boolean, size: bigint, collateral: bigint, averagePrice: bigint) {
  const liquidationAmount = size * BASIS_POINTS_DIVISOR / MAX_LEVERAGE

  if (liquidationAmount > collateral) {
    const liquidationDelta = liquidationAmount - collateral
    const priceDelta = liquidationDelta * averagePrice / size
    return isLong ? averagePrice + priceDelta : averagePrice - priceDelta
  }

  const liquidationDelta = collateral - liquidationAmount
  const priceDelta = liquidationDelta * averagePrice / size

  return isLong ? averagePrice - priceDelta : averagePrice + priceDelta
}


export function isTradeSettled(trade: ITrade): trade is ITradeSettled {
  return trade.status !== TradeStatus.OPEN
}

export function isTradeOpen(trade: ITrade): trade is ITradeOpen {
  return trade.status === TradeStatus.OPEN
}

export function isTradeLiquidated(trade: ITrade): trade is ITradeLiquidated {
  return trade.status === TradeStatus.LIQUIDATED
}

export function isTradeClosed(trade: ITrade): trade is ITradeClosed {
  return trade.status === TradeStatus.CLOSED
}

export function isPositionLiquidated(trade: IPositionClose | IPositionLiquidated): trade is IPositionLiquidated {
  return 'markPrice' in trade
}

// function getFundingFee(address /* _account */, address _collateralToken, address /* _indexToken */, bool /* _isLong */, uint256 _size, uint256 _entryFundingRate) public override view returns(uint256) {
//   if (_size == 0) { return 0; }

//         uint256 fundingRate = vault.cumulativeFundingRates(_collateralToken).sub(_entryFundingRate);
//   if (fundingRate == 0) { return 0; }

//   return _size.mul(fundingRate).div(FUNDING_RATE_PRECISION);
// }

export function getFundingFee(entryFundingRate: bigint, cumulativeFundingRate: bigint, size: bigint) {
  return (size * (cumulativeFundingRate - entryFundingRate)) / FUNDING_RATE_PRECISION
}


export function toAccountSummary(list: ITrade[]): IAccountSummary[] {
  const settledListMap = groupByMapMany(list, a => a.account)
  const allPositions = Object.entries(settledListMap)

  return allPositions.reduce((seed, [account, allSettled]) => {

    const seedAccountSummary: IAccountSummary = {
      claim: null,
      account,

      collateral: 0n,
      size: 0n,

      fee: 0n,
      realisedPnl: 0n,

      collateralDelta: 0n,
      sizeDelta: 0n,
      realisedPnlPercentage: 0n,

      winTradeCount: 0,
      settledTradeCount: 0,
      openTradeCount: 0,
    }

    const summary = allSettled.reduce((seed, next): IAccountSummary => {

      return {
        ...seed,
        fee: seed.fee + next.fee,
        collateral: seed.collateral + next.collateral,
        collateralDelta: seed.collateralDelta + next.collateralDelta,
        realisedPnl: seed.realisedPnl + (next.realisedPnl - next.fee),
        size: seed.size + next.size,
        sizeDelta: seed.sizeDelta + next.sizeDelta,
        realisedPnlPercentage: seed.realisedPnlPercentage + next.realisedPnlPercentage,

        winTradeCount: next.realisedPnl > 0n ? seed.winTradeCount + 1 : seed.winTradeCount,
        settledTradeCount: next.status === TradeStatus.CLOSED || next.status === TradeStatus.LIQUIDATED ? seed.settledTradeCount + 1 : seed.settledTradeCount,
        openTradeCount: next.status === TradeStatus.OPEN ? seed.openTradeCount + 1 : seed.openTradeCount,

      }
    }, seedAccountSummary)

    seed.push(summary)

    return seed
  }, [] as IAccountSummary[])
}



function easeInExpo(x: number) {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
}

export function liquidationWeight(isLong: boolean, liquidationPriceUSD: bigint, markPriceUSD: bigint) {
  const weight = isLong ? liquidationPriceUSD * BASIS_POINTS_DIVISOR / markPriceUSD : markPriceUSD * BASIS_POINTS_DIVISOR / liquidationPriceUSD
  const newLocal = formatFixed(weight, 4)
  const value = easeInExpo(newLocal)
  return value > 1 ? 1 : value
}


export function validateIdentityName(name: string) {
  if (typeof name === 'string' && name.startsWith('@') && !(/^@?(\w){1,15}$/.test(name))) {
    throw new Error('Invalid twitter handle')
  }

  if (typeof name !== 'string' || name.length > 15 || String(name).length < 4) {
    throw new Error('Invalid name')
  }

}

export function parseTwitterClaim(account: string, name: string): IClaim {
  if (!isAddress(account)) {
    throw new Error('Invalid address')
  }

  validateIdentityName(name)

  return {
    name,
    account,
    data: '',
    sourceType: IClaimSource.TWITTER
  }
}


