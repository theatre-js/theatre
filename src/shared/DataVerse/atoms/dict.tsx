import {default as AbstractCompositeAtom} from './utils/AbstractCompositeAtom'
import forEach from 'lodash/forEach'
import mapValues from 'lodash/mapValues'
import deriveFromDictAtom from '$shared/DataVerse/derivations/dicts/deriveFromDictAtom'
import {
  default as pointer,
  PointerDerivation,
} from '$shared/DataVerse/derivations/pointer'
import {UnatomifyDeep} from './utils/types'
import AbstractDerivedDict from '$src/shared/DataVerse/derivations/dicts/AbstractDerivedDict'

interface DictAtomChangeType<O> {
  overriddenRefs: Partial<O>
  deletedKeys: Array<keyof O>
  addedKeys: Array<keyof O>
}

export class DictAtom<O> extends AbstractCompositeAtom<DictAtomChangeType<O>> {
  isDictAtom = true
  Type: O
  _internalMap: O
  _pointer: $FixMe

  constructor(o: O) {
    super()
    this._internalMap = {} as $IntentionalAny
    this._pointer = undefined

    this._assignInitialValue(o)
    return this
  }

  unboxDeep(): UnatomifyDeep<O> {
    return mapValues(
      this._internalMap,
      v => (v ? v.unboxDeep() : v),
    ) as $IntentionalAny
  }

  _assignInitialValue(o: O) {
    forEach(o, (v, k: keyof O) => {
      this._internalMap[k] = v
      this._adopt(k, v)
    })
  }

  assign(o: Partial<O>): this {
    return this._change(o, [])
  }

  clear(): this {
    this._change({}, this.keys())
    return this
  }

  _change(o: Partial<O>, keysToDelete: Array<keyof O>): this {
    const addedKeys: Array<keyof O> = []
    forEach(o, (_v, k: keyof O) => {
      if (!this._internalMap.hasOwnProperty(k)) {
        addedKeys.push(k)
      }
    })

    const overriddenRefs = mapValues(o, (_v, k: keyof O) => {
      return this.prop(k)
    })

    const deletedKeys = keysToDelete
    deletedKeys.forEach(propName => {
      overriddenRefs[propName] = this.prop(propName)
    })

    forEach(overriddenRefs, v => {
      if (v) {
        this._unadopt(v as $IntentionalAny)
      }
    })

    deletedKeys.forEach(key => {
      delete this._internalMap[key]
    })

    forEach(o as O, (v, k: keyof O) => {
      this._internalMap[k] = v
      this._adopt(k, v)
    })

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit({
        overriddenRefs: o,
        deletedKeys: deletedKeys,
        addedKeys,
      })
    }

    return this
  }

  setProp<K extends keyof O, V extends O[K]>(key: K, value: V): this {
    return this.assign({[key]: value} as $IntentionalAny)
  }

  prop<K extends keyof O>(key: K): O[K] {
    if (this._internalMap.hasOwnProperty(key)) {
      return this._internalMap[key] as $IntentionalAny
    } else {
      return undefined as any
    }
  }

  forEach<K extends keyof O>(fn: (v: O[K], k: K) => void | false): void {
    forEach(this._internalMap, fn)
  }

  deleteProp<K extends keyof O>(key: K): this {
    return this._change({}, [key])
  }

  // pointerTo(key: keyof O) {
  //   return this.pointer().prop(key)
  // }

  keys(): Array<keyof O> {
    return Object.keys(this._internalMap) as $IntentionalAny
  }

  derivedDict(): AbstractDerivedDict<O> {
    return deriveFromDictAtom(this) as $IntentionalAny
  }

  pointer(): PointerDerivation<this> {
    if (!this._pointer) {
      this._pointer = pointer({type: 'WithPath', root: this, path: []})
    }
    return this._pointer
  }
}

export default function dictAtom<O>(o: O): DictAtom<O> {
  return new DictAtom(o)
}

export function isDictAtom(v: mixed): v is DictAtom<mixed> {
  return v instanceof DictAtom
}
