import type {$IntentionalAny} from './types'

type PathToProp = Array<string | number>

type PointerMeta = {
  root: {}
  path: (string | number)[]
}

export type UnindexableTypesForPointer =
  | number
  | string
  | boolean
  | null
  | void
  | undefined
  | Function // eslint-disable-line @typescript-eslint/ban-types

export type UnindexablePointer = {
  [K in $IntentionalAny]: Pointer<undefined>
}

const pointerMetaWeakMap = new WeakMap<{}, PointerMeta>()

export type PointerType<O> = {
  $$__pointer_type: O
}

export type Pointer<O> = PointerType<O> &
  (O extends UnindexableTypesForPointer
    ? UnindexablePointer
    : unknown extends O
    ? UnindexablePointer
    : O extends (infer T)[]
    ? Pointer<T>[]
    : O extends {}
    ? {[K in keyof O]-?: Pointer<O[K]>}
    : UnindexablePointer)

const pointerMetaSymbol = Symbol('pointerMeta')

const cachedSubPointersWeakMap = new WeakMap<
  {},
  Record<string | number, Pointer<unknown>>
>()

const handler = {
  get(obj: {}, prop: string | typeof pointerMetaSymbol): $IntentionalAny {
    if (prop === pointerMetaSymbol) return pointerMetaWeakMap.get(obj)!

    let subs = cachedSubPointersWeakMap.get(obj)
    if (!subs) {
      subs = {}
      cachedSubPointersWeakMap.set(obj, subs)
    }

    if (subs[prop]) return subs[prop]

    const meta = pointerMetaWeakMap.get(obj)!

    const subPointer = pointer({root: meta.root, path: [...meta.path, prop]})
    subs[prop] = subPointer
    return subPointer
  },
}

export const getPointerMeta = (p: Pointer<$IntentionalAny>): PointerMeta => {
  const meta: PointerMeta = p[
    pointerMetaSymbol as unknown as $IntentionalAny
  ] as $IntentionalAny
  return meta
}

export const getPointerParts = (
  p: Pointer<$IntentionalAny>,
): {root: {}; path: PathToProp} => {
  const {root, path} = getPointerMeta(p)
  return {root, path}
}

function pointer<O>({
  root,
  path,
}: {
  root: {}
  path: Array<string | number>
}): Pointer<O>
function pointer(args: {root: {}; path?: Array<string | number>}) {
  const meta: PointerMeta = {
    root: args.root as $IntentionalAny,
    path: args.path ?? [],
  }
  const hiddenObj = {}
  pointerMetaWeakMap.set(hiddenObj, meta)
  return new Proxy(hiddenObj, handler) as Pointer<$IntentionalAny>
}

export default pointer
