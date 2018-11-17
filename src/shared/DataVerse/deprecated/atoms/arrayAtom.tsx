import {default as AbstractCompositeAtom} from './utils/AbstractCompositeAtom'
import {forEach} from '$shared/utils'
import deriveFromArrayAtom from '$shared/DataVerse/deprecated/atomDerivations/arrays/deriveFromArrayAtom'
import {range} from '$shared/utils'
import {
  default as pointer,
  PointerDerivation,
} from '$shared/DataVerse/deprecated/atomDerivations/deprecatedPointer'
import isAtom from '$shared/DataVerse/deprecated/atoms/utils/isAtom'
import {UnatomifyDeep} from './utils/UnatomifyDeep'
import AbstractDerivedArray from '$shared/DataVerse/deprecated/atomDerivations/arrays/AbstractDerivedArray'

export interface IArrayAtomChangeType<V> {
  startIndex: number
  deleteCount: number
  addedRefs: Array<V>
}

const changeDescriptor = <V extends {}>(
  startIndex: number,
  deleteCount: number,
  refsToAdd: Array<V>,
): IArrayAtomChangeType<V> => ({
  startIndex,
  deleteCount: deleteCount,
  addedRefs: refsToAdd,
})

export class ArrayAtom<V> extends AbstractCompositeAtom<
  IArrayAtomChangeType<V>
> {
  isArrayAtom = true
  _pointer: undefined | $FixMe
  _internalArray: V[]
  Type: V

  constructor(a: V[]) {
    super()
    this._internalArray = []
    this._pointer = undefined

    forEach(a, (value: V) => {
      this._pushWithoutInvokingEvents(value)
    })
    return this
  }

  _pushWithoutInvokingEvents(value: V) {
    this._internalArray.push(value)
    this._adopt(this._internalArray.length - 1, value)
  }

  unboxDeep(): UnatomifyDeep<V> {
    return this._internalArray.map(value => {
      if (isAtom(value)) {
        return value.unboxDeep()
      } else {
        return value
      }
    }) as $IntentionalAny
  }

  unbox(): V[] {
    return [...this._internalArray]
  }

  replace(a: V[]): this {
    this.splice(0, this.length(), a)
    return this
  }

  length(): number {
    return this._internalArray.length
  }

  splice(startIndex: number, deleteCount: number, refsToAdd: Array<V>) {
    const removedRefs = range(startIndex, startIndex + deleteCount).map(i =>
      this.index(i),
    )

    removedRefs.forEach(r => {
      if (!!!r) throw new Error(`ArrayAtom: This should never happen`)
      this._unadopt(r)
    })

    this._internalArray.splice(startIndex, deleteCount, ...refsToAdd)
    refsToAdd.forEach((ref, i) => {
      const index = i + startIndex
      this._adopt(index, ref)
    })

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit(
        changeDescriptor(startIndex, deleteCount, refsToAdd),
      )
    }
  }

  setIndex(index: number, value: V) {
    return this.splice(index, 1, [value])
  }

  indexOf(v: V): number {
    return this._internalArray.indexOf(v)
  }

  pluck(v: V): this {
    const index = this.indexOf(v)
    if (index !== -1) {
      this.splice(index, 1, [])
    }
    return this
  }

  push(rows: Array<V>) {
    return this.splice(this.length(), 0, rows)
  }

  pop() {
    const last = this.last()
    this.splice(this.length() - 1, 1, [])
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
    this.splice(0, 1, [])
    return head
  }

  unshift(row: V) {
    this.splice(0, 0, [row])
  }

  index(index: number): V {
    return this._internalArray[index]
  }

  derivedArray(): AbstractDerivedArray<V> {
    return deriveFromArrayAtom(this)
  }

  pointer(): PointerDerivation<this> {
    if (!this._pointer) {
      this._pointer = pointer({type: 'WithPath', root: this, path: []})
    }
    return this._pointer
  }
}

export default function arrayAtom<V>(a: Array<V>): ArrayAtom<V> {
  return new ArrayAtom(a)
}
