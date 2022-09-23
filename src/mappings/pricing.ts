/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../types/schema'
import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD, UNTRACKED_PAIRS, FACTORY_ADDRESS } from './helpers'
import { Factory as FactoryContract } from '../types/templates/Pair/Factory'

// const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
// const USDC_WETH_PAIR = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc' // created 10008355
// const DAI_WETH_PAIR = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11' // created block 10042267
// const USDT_WETH_PAIR = '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' // created block 10093341

// for canto, ETH ~ NOTE
const WETH_ADDRESS = '0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503' // NOTE
const USDC_WETH_PAIR = '0x9571997a66d63958e1b3de9647c22bd6b9e7228c' // USDC_NOTE_PAIR block
const USDT_WETH_PAIR = '0x35db1f3a6a6f07f82c76fcc415db6cfb1a7df833' // USDT_NOTE_PAIR

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  // let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token1
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  // all 3 have been created
  // if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
  //   let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
  //   let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
  //   let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
  //   let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
  //   return daiPair.token0Price
  //     .times(daiWeight)
  //     .plus(usdcPair.token0Price.times(usdcWeight))
  //     .plus(usdtPair.token1Price.times(usdtWeight))
  //   // dai and USDC have been created
  // } else if (daiPair !== null && usdcPair !== null) {
  //   let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1)
  //   let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
  //   let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
  //   return daiPair.token0Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
  //   // USDC is the only pair so far
  // } else if (usdcPair !== null) {
  //   return usdcPair.token0Price
  // } else {
  //   return ZERO_BD
  // }

  // all 2 have been created
  if (usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = usdtPair.reserve1.plus(usdcPair.reserve1)
    let usdtweight = usdtPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    return usdtPair.token1Price.times(usdtweight).plus(usdcPair.token1Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token1Price
    // USDT is the only pair so far
  } else if (usdtPair !== null) {
    return usdtPair.token1Price
  } else {
    return ZERO_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
// let WHITELIST: string[] = [
//   '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
//   '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
//   '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
//   '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
//   '0x0000000000085d4780b73119b644ae5ecd22b376', // TUSD
//   '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
//   '0x39aa39c021dfbae8fac545936693ac917d5e7563', // cUSDC
//   '0x86fadb80d8d2cff3c3680819e4da99c10232ba0f', // EBASE
//   '0x57ab1ec28d129707052df4df418d58a2d46d5f51', // sUSD
//   '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
//   '0xc00e94cb662c3520282e6f5717214004a7f26888', // COMP
//   '0x514910771af9ca656af840dff83e8264ecf986ca', //LINK
//   '0x960b236a07cf122663c4303350609a66a7b288c0', //ANT
//   '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //SNX
//   '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', //YFI
//   '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8', // yCurv
//   '0x853d955acef822db058eb8505911ed77f175b99e', // FRAX
//   '0xa47c8bf37f92abed4a126bda807a7b7498661acd', // WUST
//   '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
//   '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' // WBTC
// ]

let WHITELIST: string[] = [
  '0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503', // NOTE
  '0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd', // USDC
  '0xd567b3d7b8fe3c79a1ad8da978812cfc4fa05e75', // USDT
  '0xeceeefcee421d8062ef8d6b4d814efe4dc898265', // ATOM
  '0x5fd55a1b9fc24967c4db09c513c3ba0dfa7ff687', // ETH
  '0x826551890dc65655a0aceca109ab11abdbd7a07b' // wCANTO
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
// let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('400000')
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
// let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('2')
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    // let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]), false)
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // dont count tracked volume on these pairs - usually rebass tokens
  if (UNTRACKED_PAIRS.includes(pair.id)) {
    return ZERO_BD
  }

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  let TWO_BD = BigDecimal.fromString('2')
  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    let result = poolNotLowLiquidity(token0.id, tokenAmount0, token1.id, tokenAmount1)
    if (result == 0) {
      return tokenAmount0.times(price0).times(TWO_BD)
    } else if (result == 1) {
      return tokenAmount1.times(price1).times(TWO_BD)
    } else if (result == 2) {
      return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
    } else {
      return ZERO_BD
    }
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    let result = poolNotLowLiquidity(token0.id, tokenAmount0, '', ZERO_BD)
    if (result == 0) {
      return tokenAmount0.times(price0).times(TWO_BD)
    } else {
      return ZERO_BD
    }
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    let result = poolNotLowLiquidity('', ZERO_BD, token1.id, tokenAmount1)
    if (result == 1) {
      return tokenAmount1.times(price1).times(TWO_BD)
    } else {
      return ZERO_BD
    }
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/*
LOGIC
- if price is fetched from pool w low liquidity then value of token can be absurdly high
- so set a threshold that if whitelisted asset is being used to determine price, then
  the amount of the whitelisted asset in a pool (reserve) must be >= 0.5 % of
  the amount of whitelisted asset in pool with highest whitelisted asset reserve tokens
  
POSSIBLE RETURN VALUES
- if token0 != ""                 --> -1, 0
- if token1 != ""                 --> -1, 1
- if token0 != "" && token1 != "" --> -1, 0, 1, 2

RETURN VALUES
- -1  -- indicate pool has low liquidity
- 0/1 -- indicate that token0/token1 has sufficient liquidity
- 2   -- indicate that both token0 and token1 have sufficient liquidity
*/
function poolNotLowLiquidity(
  token0: string,
  token0Amount: BigDecimal,
  token1: string,
  token1Amount: BigDecimal
): number {
  // get all pairs
  let pairsResult = getAllPairs()
  if (pairsResult == null) {
    return -1
  }

  let pairs = pairsResult as Pair[]

  // max reserve
  let t0MaxReserve = getMaxReserve(pairs, token0)
  let t1MaxReserve = getMaxReserve(pairs, token1)

  // threshold
  let T = BigDecimal.fromString('0.005') // 0.5 %
  let t0Result = 0,
    t1Result = 0
  if (satisfyRatioThreshold(token0Amount, t0MaxReserve, T)) {
    t0Result = 1
  }

  if (satisfyRatioThreshold(token1Amount, t1MaxReserve, T)) {
    t1Result = 1
  }

  // result
  if (t0Result == 0 && t1Result == 0) {
    return -1
  } else if (t0Result == 0 && t1Result == 1) {
    return 1
  } else if (t0Result == 0 && t1Result == 0) {
    return 0
  } else if (t0Result == 1 && t1Result == 1) {
    return 2
  } else {
    return -1
  }
}

function getAllPairs(): Pair[] | null {
  let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
  let pairsLengthResult = factoryContract.try_allPairsLength()
  if (pairsLengthResult.reverted) {
    return null
  }

  let pairsLength = pairsLengthResult.value.toI32()
  // get pair ids
  let pairIds: Address[] = []
  for (let i: i32 = 0; i < pairsLength; i++) {
    let pairId = getPairId(factoryContract, i)
    if (pairId !== null) {
      pairIds.push(pairId as Address)
    }
  }

  // get pairs
  let pairs: Pair[] = []
  for (let i = 0; i < pairIds.length; i++) {
    let pair = Pair.load(pairIds[i].toHex())
    if (pair !== null) {
      pairs.push(pair as Pair)
    }
  }

  if (pairs.length == 0) {
    return null
  }

  return pairs
}

function getPairId(contract: FactoryContract, i: i32): Address | null {
  let pairResult = contract.try_allPairs(BigInt.fromI32(i))
  if (pairResult.reverted) {
    return null
  }

  return pairResult.value
}

function satisfyRatioThreshold(
  amount: BigDecimal, 
  amountMax: BigDecimal, 
  threshold: BigDecimal
): boolean {
  let result = false

  if (amountMax.gt(ZERO_BD)) {
    let ratio = amount.div(amountMax)
    if (ratio.ge(threshold)) {
      result = true
    }
  }

  return result
}

function getMaxReserve(
  pairs: Pair[],
  tokenAddress: string
): BigDecimal {
  if (tokenAddress == '') {
    return ZERO_BD
  }

  let reserveMax = ZERO_BD
  for (let i = 0; i < pairs.length; i++) {
    let p = pairs[i]

    if (p.token0 == tokenAddress && reserveMax < p.reserve0) {
      reserveMax = p.reserve0
    } else if (p.token1 == tokenAddress && reserveMax < p.reserve1) {
      reserveMax = p.reserve1
    }
  }

  return reserveMax
}
