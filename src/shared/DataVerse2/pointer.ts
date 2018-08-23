import {Atom, Pointable} from './atom'
import {IdentityDerivation} from './identityDerivation'

export type PointerInnerObj<O> = {
  $pointerMeta: {
    type: O
    root: Atom<$IntentionalAny>
    path: Array<string | number>
    cachedSubPointers: Record<$IntentionalAny, PointerInnerObj<$IntentionalAny>>
    identityDerivation: undefined | IdentityDerivation<O>
  }
}

export type UnindexableTypesForPointer =
  | number
  | string
  | boolean
  | null
  | void
  | undefined
  | Function

export type UnindexablePointer = {[K in $IntentionalAny]: Pointer<UnindexablePointer>}

export type Pointer<O> = {
  '1': PointerInnerObj<O> &
    (O extends UnindexableTypesForPointer
      ? UnindexablePointer
      : O extends Array<infer T> 
      ? Array<Pointer<T>>
      : O extends {}
        ? {[K in keyof O]-?: Pointer<O[K]>}
        : UnindexablePointer)
}[O extends number ? '1' : '1']

const handler = {
  get(obj: PointerInnerObj<mixed>, prop: string): $IntentionalAny {
    const meta = obj.$pointerMeta
    if (prop === '$pointerMeta') return meta
    if (meta.cachedSubPointers[prop]) return meta.cachedSubPointers[prop]
    const subPointer = pointer({root: meta.root, path: [...meta.path, prop]})
    meta.cachedSubPointers[prop] = subPointer
    return subPointer
  },
}

const pointer = <O>({
  root,
  path,
}: {
  root: Pointable
  path: Array<string | number>
}): Pointer<O> => {
  return new Proxy(
    {
      $pointerMeta: {
        type: null as $IntentionalAny,
        root,
        path,
        cachedSubPointers: {},
      },
    },
    handler,
  ) as $IntentionalAny
}

export default pointer

