import type {IdentityDerivationProvider} from './Atom'
import type {Pointer} from './pointer'
import pointer from './pointer'
import type {IBox} from './Box'
import Box from './Box'
import type {$FixMe, $IntentionalAny} from './types'
import {valueDerivation} from './Atom'

export default class PointerProxy<O extends {}>
  implements IdentityDerivationProvider
{
  readonly $$isIdentityDerivationProvider = true
  private readonly _currentPointerBox: IBox<Pointer<O>>
  readonly pointer: Pointer<O>

  constructor(currentPointer: Pointer<O>) {
    this._currentPointerBox = new Box(currentPointer)
    this.pointer = pointer({root: this as $FixMe, path: []})
  }

  setPointer(p: Pointer<O>) {
    this._currentPointerBox.set(p)
  }

  getIdentityDerivation(path: Array<string | number>) {
    return this._currentPointerBox.derivation.flatMap((p) => {
      const subPointer = path.reduce(
        (pointerSoFar, pathItem) => (pointerSoFar as $IntentionalAny)[pathItem],
        p,
      )
      return valueDerivation(subPointer)
    })
  }
}
