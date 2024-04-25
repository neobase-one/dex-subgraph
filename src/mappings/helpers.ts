/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address, ethereum } from '@graphprotocol/graph-ts'
import { ERC20 } from '../types/Factory/ERC20'
import { ERC20SymbolBytes } from '../types/Factory/ERC20SymbolBytes'
import { ERC20NameBytes } from '../types/Factory/ERC20NameBytes'
import { User, Bundle, Token, LiquidityPosition, LiquidityPositionSnapshot, Pair } from '../types/schema'
import { Factory as FactoryContract } from '../types/templates/Pair/Factory'
import { TokenDefinition } from './tokenDefinition'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0xE387067f12561e579C5f7d4294f51867E0c1cFba'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

// rebass tokens, dont count in tracked volume
export let UNTRACKED_PAIRS: string[] = []

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function exponentToBigInt(decimals: BigInt): BigInt {
  let bi = BigInt.fromI32(1)
  for (let i = ZERO_BI; i.lt(decimals); i = i.plus(ONE_BI)) {
    bi = bi.times(BigInt.fromI32(10))
  }
  return bi
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
  if(staticDefinition != null) {
    return (staticDefinition).symbol
  }

  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
  if(staticDefinition != null) {
    return (staticDefinition).name
  }

  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress)
  let totalSupplyResult = contract.try_totalSupply()
  if (!totalSupplyResult.reverted) {
    return totalSupplyResult.value
  }
  return ZERO_BI
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
  if(staticDefinition != null) {
    return (staticDefinition).decimals
  }

  let contract = ERC20.bind(tokenAddress)
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    return BigInt.fromI32(decimalResult.value)
  }
  return ZERO_BI
}

export function createLiquidityPosition(exchange: Address, user: Address): LiquidityPosition {
  let id = exchange
    .toHexString()
    .concat('-')
    .concat(user.toHexString())
  let liquidityTokenBalance = LiquidityPosition.load(id)
  if (liquidityTokenBalance === null) {
    let pair = Pair.load(exchange.toHexString())!
    pair.liquidityProviderCount = pair.liquidityProviderCount.plus(ONE_BI)
    liquidityTokenBalance = new LiquidityPosition(id)
    liquidityTokenBalance.liquidityTokenBalance = ZERO_BD
    liquidityTokenBalance.pair = exchange.toHexString()
    liquidityTokenBalance.user = user.toHexString()
    liquidityTokenBalance.save()
    pair.save()
  }
  if (liquidityTokenBalance === null) log.error('LiquidityTokenBalance is null', [id])
  return liquidityTokenBalance
}

export function createUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.usdSwapped = ZERO_BD
    user.save()
  }
}

export function createLiquiditySnapshot(position: LiquidityPosition, event: ethereum.Event): void {
  let timestamp = event.block.timestamp.toI32()
  let bundle = Bundle.load('1')!
  let pair = Pair.load(position.pair)
  if (pair == null) return
  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)
  if (token0 == null || token1 == null) return

  // create new snapshot
  let snapshot = new LiquidityPositionSnapshot(position.id.concat(timestamp.toString()))
  snapshot.liquidityPosition = position.id
  snapshot.timestamp = timestamp
  snapshot.block = event.block.number.toI32()
  snapshot.user = position.user
  snapshot.pair = position.pair
  snapshot.token0PriceUSD = token0.derivedETH.times(bundle.ethPrice)
  snapshot.token1PriceUSD = token1.derivedETH.times(bundle.ethPrice)
  snapshot.reserve0 = pair.reserve0
  snapshot.reserve1 = pair.reserve1
  snapshot.reserveUSD = pair.reserveUSD
  snapshot.liquidityTokenTotalSupply = pair.totalSupply
  snapshot.liquidityTokenBalance = position.liquidityTokenBalance
  snapshot.liquidityPosition = position.id
  snapshot.save()
  position.save()
}

export function pairMapKey(token0: string, token1: string): string {
  return token0.toLowerCase() + "-" + token1.toLowerCase()
}

// Simulates the swap price when X is exchanged for Y i.e. Y_out = computeSwapPrice(Y_reserve, X_reserve) * X_in
// Note that reserves should be normalized (divided by token decimal) for correct stable pair calculation
export function computeSwapPrice(reserveY: BigDecimal, reserveX: BigDecimal, isStable: boolean): BigDecimal {
  if (isStable) {
    // x^3y + y^3x = constant
    // -dy/dx = (3x^2y + y^3) / (3y^2x + x^3)
    if (reserveY.equals(ZERO_BD) && reserveX.equals(ZERO_BD)) return ZERO_BD
    let three = BigDecimal.fromString('3')
    let x_2 = reserveX.times(reserveX)
    let y_2 = reserveY.times(reserveY)
    let numerator = three.times(x_2).times(reserveY).plus(y_2.times(reserveY))
    let denominator = three.times(y_2).times(reserveX).plus(x_2.times(reserveX))
    return numerator.div(denominator)
  } else {
    // x * y = constant
    // -dy/dx = y/x
    if (reserveX.equals(ZERO_BD)) return ZERO_BD
    return reserveY.div(reserveX)
  }
}
