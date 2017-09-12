// @flow
import {default as CompositeAtom, type ICompositeAtom} from './utils/CompositeAtom'
import {forEach} from 'lodash'
import {type IAtom} from './utils/Atom'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'

export interface IArrayAtom<V: IAtom> extends IAtom, ICompositeAtom {
  isArrayAtom: true,
  set(key: number, v: V): $FixMe,
  get(index: number): ?V,
  diffs: () => Tappable<ArrayDiff<V>>,
  deepDiffs: () => Tappable<ArrayDeepDiff<V>>,
  push(...rows: Array<V>): void,
  pop(): ?V,
  shift(): ?V,
  head(): ?V,
  last(): ?V,
  unshift(row: V): void,
}

type ArrayDiff<V> = {
  startIndex: number,
  deleteCount: number,
  additions: Array<V>,
}

type ArrayDeepDiff<T> = {
  type: 'ArrayDeepDiff',
  startIndex: number,
  deletedRows: Array<$FixMe>,
  addedRows: Array<$FixMe>,
}

export default class ArrayAtom<V: IAtom> extends CompositeAtom implements IArrayAtom<V> {
  isArrayAtom = true
  _internalArray: Array<$FixMe>
  _deepDiffEmitter: Emitter<ArrayDeepDiff<V>>
  _diffEmitter: Emitter<ArrayDiff<V>>
  diffs: () => Tappable<ArrayDiff<V>>
  deepDiffs: () => Tappable<ArrayDeepDiff<V>>

  constructor(a: Array<V>) {
    super()
    this._internalArray = []

    forEach(a, (value: V) => {
      this._pushWithoutInvokingEvents(value)
    })
  }

  _pushWithoutInvokingEvents(value: V) {
    this._internalArray.push(value)
    this._adopt(this._internalArray.length - 1, value)
  }

  _setWithoutInvokingEvents(index: number, value: V) {
    this._internalArray[index] = value
    this._adopt(index, value)
  }

  unboxDeep(): $FixMe {
    return this._internalArray.map((value) => {
      if (value !== undefined) {
        return value.unboxDeep()
      }
    })
  }

  length() {
    return this._internalArray.length
  }

  splice(startIndex: number, deleteCount: number, ...refsToAdd: Array<V>) {
    const removedRefs = new Array(deleteCount).map((i) => i + startIndex).map((i) => this.get(i))

    removedRefs.forEach((r) => {
      if (r) r._unsetParent()
    })

    this._internalArray.splice(startIndex, deleteCount, refsToAdd)
    refsToAdd.forEach((ref) => {
      ref._setParent(this)
    })

    if (this._deepDiffEmitter.hasTappers()) {
      const removedRefsDeeplyUnboxed = removedRefs.map((r) => r ? r.unboxDeep() : undefined)
      const addedRefsDeeplyUnboxed = refsToAdd.map((r) => r.unboxDeep())
      this._deepDiffEmitter.emit({
        type: 'ArrayDeepDiff',
        startIndex,
        deletedRows: removedRefsDeeplyUnboxed,
        addedRows: addedRefsDeeplyUnboxed,
      })
    }

    if (this._diffEmitter.hasTappers()) {
      this._diffEmitter.emit({
        startIndex, deleteCount, additions: refsToAdd,
      })
    }
  }

  set(index: number, value: V) {
    return this.splice(index, 1, value)
  }

  push(...rows: Array<V>) {
    return this.splice(this.length(), 0, ...rows)
  }

  pop() {
    const last = this.last()
    this.splice(this.length() - 1, 1)
    return last
  }

  head() {
    return this._internalArray[0]
  }

  last() {
    return this._internalArray[this._internalArray.length - 1]
  }

  shift() {
    const head = this.head()
    this.splice(0, 1)
    return head
  }

  unshift(row: V) {
    this.splice(0, 0, row)
  }

  get(index: number): ?V {
    return this._internalArray[index]
  }
}