/**
 * The animation-optimized FRP library powering the internals of Theatre.js.
 *
 * @packageDocumentation
 */

export type {IdentityDerivationProvider} from './Atom'
export {default as Atom, val, valueDerivation} from './Atom'
export {default as Box} from './Box'
export type {IBox} from './Box'
export {default as AbstractDerivation} from './derivations/AbstractDerivation'
export {default as ConstantDerivation} from './derivations/ConstantDerivation'
export {default as DerivationFromSource} from './derivations/DerivationFromSource'
export {isDerivation} from './derivations/IDerivation'
export type {IDerivation} from './derivations/IDerivation'
export {default as iterateAndCountTicks} from './derivations/iterateAndCountTicks'
export {default as iterateOver} from './derivations/iterateOver'
export {default as prism} from './derivations/prism/prism'
export {default as pointer, getPointerParts, isPointer} from './pointer'
export type {Pointer, PointerType, OpaqueToPointers} from './pointer'
export {default as Ticker} from './Ticker'
export {default as PointerProxy} from './PointerProxy'
