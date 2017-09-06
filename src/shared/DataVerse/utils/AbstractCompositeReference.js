// @flow
import AbstractReference from './AbstractReference'
import {default as getDeep, type GetDeepArg} from './getDeep'
import {type Diff} from '../types'

export default class AbstractCompositeReference extends AbstractReference {
  _diffEventListenersForChildren: *

  constructor() {
    super()
    this._diffEventListenersForChildren = new Map()
  }

  getDeep(path: GetDeepArg) {
    return getDeep(this, path)
  }

  _adopt(key: string | number, value: AbstractReference) {
    const diffListener = (diff: Diff) => {
      this.events.emit('diff', {...diff, address: [key, ...diff.address]})
    }

    this._diffEventListenersForChildren.set(key, diffListener)
    value.events.addEventListener('diff', diffListener)
  }

  _unadopt(key: string | number, value: AbstractReference) {
    const diffListener: $FixMe = this._diffEventListenersForChildren.get(key)
    value.events.removeEventListener('diff', diffListener)
    this._diffEventListenersForChildren.delete(value)
  }
}