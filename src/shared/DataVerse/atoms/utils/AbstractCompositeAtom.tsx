import {default as AbstractAtom} from './AbstractAtom'
import isAtom from './isAtom'

export default abstract class AbstractCompositeAtom<
  ChangeType
> extends AbstractAtom<ChangeType> {
  isCompositeAtom = true
  // abstract _keyOfValue(): MapKey | void

  constructor() {
    super()
  }

  _adopt(key: string | number, ref: mixed | AbstractAtom<$IntentionalAny>) {
    if (!isAtom(ref)) return

    ref._setParent(this, key)
  }

  _unadopt(ref: AbstractAtom<$IntentionalAny>) {
    if (!isAtom(ref)) return
    ref._unsetParent()
  }
}
