/**
 * The animation-optimized FRP library powering the internals of Theatre.js.
 *
 * @packageDocumentation
 */

export type {PointerToPrismProvider} from './pointerToPrism'
export {default as Atom} from './Atom'
export {val} from './val'
export {pointerToPrism} from './pointerToPrism'
export {isPrism} from './prism/Interface'
export type {Prism} from './prism/Interface'
export {default as iterateAndCountTicks} from './prism/iterateAndCountTicks'
export {default as iterateOver} from './prism/iterateOver'
export {default as prism} from './prism/prism'
export {default as pointer, getPointerParts, isPointer} from './pointer'
export type {Pointer, PointerType, PointerMeta} from './pointer'
export {default as Ticker} from './Ticker'
export {default as PointerProxy} from './PointerProxy'
// export {default as asyncIterateOver} from './prism/asyncIterateOver'
