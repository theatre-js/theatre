/**
 * The animation-optimized FRP library powering the internals of Theatre.js.
 *
 * @packageDocumentation
 */

export type {IdentityPrismProvider} from './Atom'
export {default as Atom, val, pointerToPrism} from './Atom'
export {isPrism} from './prism/Interface'
export type {Prism} from './prism/Interface'
export {default as iterateAndCountTicks} from './prism/iterateAndCountTicks'
export {default as iterateOver} from './prism/iterateOver'
export {default as prism} from './prism/prism'
export {default as pointer, getPointerParts, isPointer} from './pointer'
export type {Pointer, PointerType} from './pointer'
export {default as Ticker} from './Ticker'
export {default as PointerProxy} from './PointerProxy'
