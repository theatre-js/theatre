// @flow
import {default as AbstractReference, type IAbstractReference} from './AbstractReference'
import {default as getDeep, type GetDeepArg} from './getDeep'
import {type Diff} from '../types'

export interface IAbstractCompositeReference extends IAbstractReference {
  isAbstractCompositeReference: true,
  getDeep(path: GetDeepArg): $FixMe,
  _adopt(key: string | number, value: IAbstractReference): void,
  _unadopt(key: string | number, value: IAbstractReference): void,
}

export default class AbstractCompositeReference extends AbstractReference implements IAbstractCompositeReference {
  isAbstractCompositeReference = true
  _diffUntappersForEachChild: *
  +unboxDeep: () => mixed
  _setParent: (p: IAbstractReference) => void
  _reportChange: (diff: Diff) => void

  constructor() {
    super()
    this._diffUntappersForEachChild = new Map()
  }

  getDeep(path: GetDeepArg) {
    return getDeep(this, path)
  }

  _adopt(key: string | number, value: IAbstractReference) {
    this._diffUntappersForEachChild.set(key, value.diffs().tap((diff: Diff) => {
      this._diffEmitter.emit({...diff, address: [key, ...diff.address]})
    }))

  }

  _unadopt(key: string | number, value: IAbstractReference) {
    // $FlowIgnore
    this._diffUntappersForEachChild.get(key)()
    this._diffUntappersForEachChild.delete(key)
  }
}