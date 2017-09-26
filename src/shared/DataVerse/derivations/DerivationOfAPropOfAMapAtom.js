// @flow
import Derivation from './Derivation'
import type {IMapAtom} from '$shared/DataVerse'

const noop = () => {}

export default class DerivationOfAPropOfAMapAtom<O: {}, K: $Keys<O>> extends Derivation<$ElementType<O, K>> {
  _mapAtom: IMapAtom<O>
  _untapFromMapAtomChanges: Function
  _propName: $Keys<O>

  constructor(mapAtom: IMapAtom<O>, propName: $Keys<O>) {
    super()
    this._mapAtom = mapAtom
    this._propName = propName
    this._untapFromMapAtomChanges = noop
  }

  getValue() {
    this._isUptodate = true
    return this._recalculate()
  }

  _recalculate() {
    return this._mapAtom.prop((this._propName: $FixMe))
  }

  _onWhetherPeopleCareAboutMeStateChange(peopleCare: boolean) {
    if (peopleCare) {
      this.getValue()
      this._untapFromMapAtomChanges = this._mapAtom.changes().tap((changes) => {

        if (changes.overriddenRefs.hasOwnProperty(this._propName) || changes.deletedKeys.indexOf(this._propName) !== -1)
          this._youMayNeedToUpdateYourself()
      })
    } else {
      this._untapFromMapAtomChanges()
      this._untapFromMapAtomChanges = noop
    }
  }
}