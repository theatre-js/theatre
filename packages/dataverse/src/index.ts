/**
 * The animation-optimized FRP library powering the internals of Theatre.js.
 *
 * @packageDocumentation
 */

export type {IdentityPrismProvider} from './Atom'
export {default as Atom, val, pointerToPrism} from './Atom'
export {default as Box} from './Box'
export type {IBox} from './Box'
export {isPrism} from './prisms/Interface'
export type {Prism} from './prisms/Interface'
export {default as iterateAndCountTicks} from './prisms/iterateAndCountTicks'
export {default as iterateOver} from './prisms/iterateOver'
export {default as prism} from './prisms/prism/prism'
export {default as pointer, getPointerParts, isPointer} from './pointer'
export type {Pointer, PointerType} from './pointer'
export {default as Ticker} from './Ticker'
export {default as PointerProxy} from './PointerProxy'
