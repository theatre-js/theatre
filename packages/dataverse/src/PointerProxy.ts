import * as Atom from './Atom'
import type {Pointer} from './pointer'
import pointer from './pointer'
import type {IBox} from './Box'
import Box from './Box'
import type {$FixMe, $IntentionalAny} from './types'
import {valueDerivation} from './Atom'

/**
 * Allows creating pointer-derivations where the pointer can be switched out.
 *
 * @remarks
 * This allows reacting not just to value changes at a certain pointer, but changes
 * to the proxied pointer too.
 */
export default class PointerProxy<O extends {}>
  implements Atom.PathedDerivable
{
  private readonly _currentPointerBox: IBox<Pointer<O>>
  /**
   * Convenience pointer pointing to the root of this PointerProxy.
   *
   * @remarks
   * Allows convenient use of {@link valueDerivation} and {@link val}.
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
  [Atom.pathedDerivation](path: Array<string | number>) {
    return this._currentPointerBox.derivation.flatMap((p) => {
      const subPointer = path.reduce(
        (pointerSoFar, pathItem) => (pointerSoFar as $IntentionalAny)[pathItem],
        p,
      )
      return valueDerivation(subPointer)
    })
  }
}
