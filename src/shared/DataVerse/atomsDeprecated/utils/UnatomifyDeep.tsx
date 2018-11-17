import {DictAtom} from '../dictAtom'
import {BoxAtom} from '../boxAtom'
import {ArrayAtom} from '../arrayAtom'

export type UnatomifyDeep<O> = {
  '1': O extends Array<infer T>
    ? Array<UnatomifyDeep<T>>
    : O extends ArrayAtom<infer T>
      ? Array<UnatomifyDeep<T>>
      : O extends BoxAtom<infer T>
        ? T
        : O extends DictAtom<infer T>
          ? UnatomifyDeep<T>
          : O extends {} ? {[K in keyof O]: UnatomifyDeep<O[K]>} : O
}[O extends number ? '1' : '1']
