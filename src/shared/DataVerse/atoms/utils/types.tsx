import {DictAtom} from '$src/shared/DataVerse/atoms/dict'
import {BoxAtom} from '$src/shared/DataVerse/atoms/box'
import {ArrayAtom} from '$src/shared/DataVerse/atoms/array'

export type UnatomifyDeep<O> = {
  '1':
  O extends Array<infer T> ? Array<UnatomifyDeep<T>> :
  O extends ArrayAtom<infer T> ? Array<UnatomifyDeep<T>> :
  O extends BoxAtom<infer T> ? T :
  O extends DictAtom<infer T> ? UnatomifyDeep<T> :
  O extends object ? {[K in keyof O]: UnatomifyDeep<O[K]>} :
  O
}[O extends number ? '1' : '1']

// @ts-ignore @ignore
function tests() {
  type A = DictAtom<{
    foo: BoxAtom<string>
    bar: BoxAtom<number>
    baz: DictAtom<{bazz: BoxAtom<number>}>
    bad: ArrayAtom<BoxAtom<string>>
  }>
  type AUnatomified = UnatomifyDeep<A['Type']>
  const aUnatomified: AUnatomified = {foo: 'hi', bar: 10, baz: {bazz: 12}, bad: ['hi']}
  // @ts-ignore expected
  const aUnatomifiedBad1: AUnatomified = {foo: 'hi', bar: 10, baz: {bazz: 'hi'}, bad: ['hi']}

  // const aUnatomifiedBad2: AUnatomified = {foo: null, bar: 10, baz: {bazz: 12}, bad: ['hi']}
}
