import {
  Address,
  BigInt,
} from "@graphprotocol/graph-ts"
import { NOTE_ADDRESS, USDC_ADDRESS, USDT_ADDRESS, ATOM_ADDRESS, ETH_ADDRESS, WCANTO_ADDRESS } from "./pricing"

// Initialize a Token Definition with the attributes
export class TokenDefinition {
  address : Address
  symbol: string
  name: string
  decimals: BigInt

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, name: string, decimals: BigInt) {
    this.address = address
    this.symbol = symbol
    this.name = name
    this.decimals = decimals
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<TokenDefinition> {
    let staticDefinitions = new Array<TokenDefinition>(0)

    // Add Note
    let tokenNote = new TokenDefinition(
      Address.fromString(NOTE_ADDRESS),
      'NOTE',
      'NOTE',
      BigInt.fromI32(18)
    );
    staticDefinitions.push(tokenNote);

    // Add USDC
    let tokenUsdc = new TokenDefinition(
      Address.fromString(USDC_ADDRESS),
      'USDC',
      'USDC',
      BigInt.fromI32(6)
    );
    staticDefinitions.push(tokenUsdc);

    // Add USDT
    let tokenUsdt = new TokenDefinition(
      Address.fromString(USDT_ADDRESS),
      'USDT',
      'USDT',
      BigInt.fromI32(6)
    );
    staticDefinitions.push(tokenUsdt);

    // Add ATOM
    let tokenAtom = new TokenDefinition(
      Address.fromString(ATOM_ADDRESS),
      'ATOM',
      'ATOM',
      BigInt.fromI32(6)
    );
    staticDefinitions.push(tokenAtom);

    // Add ETH
    let tokenEth = new TokenDefinition(
      Address.fromString(ETH_ADDRESS),
      'ETH',
      'ETH',
      BigInt.fromI32(18)
    );
    staticDefinitions.push(tokenEth);

    // Add wCANTO
    let tokenWeth = new TokenDefinition(
      Address.fromString(WCANTO_ADDRESS),
      'wCANTO',
      'wCANTO',
      BigInt.fromI32(18)
    );
    staticDefinitions.push(tokenWeth);

    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address) : TokenDefinition | null {
    let staticDefinitions = this.getStaticDefinitions()
    let tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      let staticDefinition = staticDefinitions[i]
      if(staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }

    // If not found, return null
    return null
  }

}
