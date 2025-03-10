import { AddressZero } from "../constant"
import { TokenDescription } from "../types"
import { groupByMap } from "../utils"
import { ARBITRUM_ADDRESS, ARBITRUM_ADDRESS_TRADE } from "./arbitrum"
import { AVALANCHE_ADDRESS, AVALANCHE_ADDRESS_TRADE } from "./avalanche"
import { TOKEN_SYMBOL } from "./symbol"


export type TradeAddress = ARBITRUM_ADDRESS_TRADE | AVALANCHE_ADDRESS_TRADE | typeof AddressZero


export const TOKEN_DESCRIPTION_LIST = [
  {
    name: "GLP",
    symbol: TOKEN_SYMBOL.GLP,
    decimals: 18,
    isStable: false,
  },
  {
    name: "GMX",
    symbol: TOKEN_SYMBOL.GMX,
    decimals: 18,
    isStable: false,
  },
  {
    name: "Avalanche",
    symbol: TOKEN_SYMBOL.AVAX,
    decimals: 18,
    isStable: false,
  },
  {
    name: "Chainlink",
    symbol: TOKEN_SYMBOL.LINK,
    decimals: 18,
    isStable: false,
  },
  {
    name: "Wrapped Bitcoin",
    symbol: TOKEN_SYMBOL.WBTC,
    decimals: 8,
    isStable: false,
  },
  {
    name: "Ethereum",
    symbol: TOKEN_SYMBOL.ETH,
    decimals: 18,
    isStable: false,
  },
  {
    name: "Wrapped Ethereum",
    symbol: TOKEN_SYMBOL.WETH,
    decimals: 18,
    isStable: false,
  },
  {
    name: "Uniswap",
    symbol: TOKEN_SYMBOL.UNI,
    decimals: 18,
    isStable: false,
  },
  {
    name: "USD Coin",
    symbol: TOKEN_SYMBOL.USDC,
    decimals: 6,
    isStable: true,
  },
  {
    name: "Tether",
    symbol: TOKEN_SYMBOL.USDT,
    decimals: 6,
    isStable: true,
  },
  {
    name: "Dai",
    symbol: TOKEN_SYMBOL.DAI,
    decimals: 18,
    isStable: true,
  },
  {
    name: "Frax",
    symbol: TOKEN_SYMBOL.FRAX,
    decimals: 18,
    isStable: true,
  },
  {
    name: "Magic Internet Money",
    symbol: TOKEN_SYMBOL.MIM,
    decimals: 18,
    isStable: true,
  },
  
] as TokenDescription[]



export const TOKEN_DESCRIPTION_MAP = groupByMap(TOKEN_DESCRIPTION_LIST, token => token.symbol)


export const CHAIN_TOKEN_ADDRESS_TO_SYMBOL = {
  [ARBITRUM_ADDRESS.GLP]: TOKEN_SYMBOL.GLP,
  [ARBITRUM_ADDRESS.GMX]: TOKEN_SYMBOL.GMX,

  [ARBITRUM_ADDRESS.NATIVE_TOKEN]: TOKEN_SYMBOL.ETH,
  [ARBITRUM_ADDRESS.LINK]: TOKEN_SYMBOL.LINK,
  [ARBITRUM_ADDRESS.UNI]: TOKEN_SYMBOL.UNI,
  [ARBITRUM_ADDRESS.WBTC]: TOKEN_SYMBOL.WBTC,

  [ARBITRUM_ADDRESS.DAI]: TOKEN_SYMBOL.DAI,
  [ARBITRUM_ADDRESS.FRAX]: TOKEN_SYMBOL.FRAX,
  [ARBITRUM_ADDRESS.MIM]: TOKEN_SYMBOL.MIM,
  [ARBITRUM_ADDRESS.USDC]: TOKEN_SYMBOL.USDC,
  [ARBITRUM_ADDRESS.USDT]: TOKEN_SYMBOL.USDT,

  [AVALANCHE_ADDRESS.NATIVE_TOKEN]: TOKEN_SYMBOL.AVAX,
  [AVALANCHE_ADDRESS.GMX]: TOKEN_SYMBOL.GMX,
  [AVALANCHE_ADDRESS.GLP]: TOKEN_SYMBOL.GLP,
  [AVALANCHE_ADDRESS.WBTCE]: TOKEN_SYMBOL.WBTC,
  [AVALANCHE_ADDRESS.WETHE]: TOKEN_SYMBOL.ETH,
  [AVALANCHE_ADDRESS.MIM]: TOKEN_SYMBOL.MIM,
  [AVALANCHE_ADDRESS.USDC]: TOKEN_SYMBOL.USDC,
  [AVALANCHE_ADDRESS.USDCE]: TOKEN_SYMBOL.USDC,
} as const


