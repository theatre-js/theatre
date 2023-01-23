import Atom from './Atom'
import {val} from './val'
import type {Pointer} from './pointer'
import {getPointerMeta} from './pointer'
import pointer from './pointer'
import type {$FixMe, $IntentionalAny} from './types'
import prism from './prism/prism'
import type {Prism} from './prism/Interface'
import type {PointerToPrismProvider} from './pointerToPrism'

/**
 * Allows creating pointer-prisms where the pointer can be switched out.
 *
 * @remarks
 * This allows reacting not just to value changes at a certain pointer, but changes
 * to the proxied pointer too.
 */
export default class PointerProxy<O extends {}>
  implements PointerToPrismProvider
{
  /**
   * @internal
   */
  readonly $$isPointerToPrismProvider = true
  private readonly _currentPointerBox: Atom<Pointer<O>>
  /**
   * Convenience pointer pointing to the root of this PointerProxy.
   *
   * @remarks
   * Allows convenient use of {@link pointerToPrism} and {@link val}.
   */
  readonly pointer: Pointer<O>

  constructor(currentPointer: Pointer<O>) {
    this._currentPointerBox = new Atom(currentPointer)
    this.pointer = pointer({root: this as $FixMe, path: []})
  }

  /**
   * Sets the underlying pointer.
   * @param p - The pointer to be proxied.
   */
  setPointer(p: Pointer<O>) {
    this._currentPointerBox.set(p)
  }

  /**
   * Returns a prism of the value at the provided sub-path of the proxied pointer.
   *
   * @param path - The path to create the prism at.
   */
  pointerToPrism<P>(pointer: Pointer<P>): Prism<P> {
    const {path} = getPointerMeta(pointer)
    return prism(() => {
      const currentPointer = this._currentPointerBox.prism.getValue()
      const subPointer = path.reduce(
        (pointerSoFar, pathItem) => (pointerSoFar as $IntentionalAny)[pathItem],
        currentPointer,
      )
      return val(subPointer) as P
    })
  }
}
