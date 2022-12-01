import type {IdentityDerivationProvider} from './Atom'
import {val} from './Atom'
import type {Pointer} from './pointer'
import pointer from './pointer'
import type {IBox} from './Box'
import Box from './Box'
import type {$FixMe, $IntentionalAny} from './types'
import prism from './derivations/prism/prism'

/**
 * Allows creating pointer-derivations where the pointer can be switched out.
 *
 * @remarks
 * This allows reacting not just to value changes at a certain pointer, but changes
 * to the proxied pointer too.
 */
export default class PointerProxy<O extends {}>
  implements IdentityDerivationProvider
{
  /**
   * @internal
   */
  readonly $$isIdentityDerivationProvider = true
  private readonly _currentPointerBox: IBox<Pointer<O>>
  /**
   * Convenience pointer pointing to the root of this PointerProxy.
   *
   * @remarks
   * Allows convenient use of {@link pointerToPrism} and {@link val}.
   */
  readonly pointer: Pointer<O>

  constructor(currentPointer: Pointer<O>) {
    this._currentPointerBox = new Box(currentPointer)
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
   * Returns a derivation of the value at the provided sub-path of the proxied pointer.
   *
   * @param path - The path to create the derivation at.
   */
  getIdentityDerivation(path: Array<string | number>) {
    return prism(() => {
      const currentPointer = this._currentPointerBox.derivation.getValue()
      const subPointer = path.reduce(
        (pointerSoFar, pathItem) => (pointerSoFar as $IntentionalAny)[pathItem],
        currentPointer,
      )
      return val(subPointer)
    })
  }
}
