import Atom from './Atom'
import {val} from './val'
import {expectType, _any} from './utils/typeTestUtils'
;() => {
  const p = new Atom<{foo: string; bar: number; optional?: boolean}>(_any)
    .pointer
  expectType<string>(val(p.foo))
  // @ts-expect-error TypeTest
  expectType<number>(val(p.foo))

  expectType<number>(val(p.bar))
  // @ts-expect-error TypeTest
  expectType<string>(val(p.bar))

  // @ts-expect-error TypeTest
  expectType<{}>(val(p.nonExistent))

  expectType<undefined | boolean>(val(p.optional))
  // @ts-expect-error TypeTest
  expectType<boolean>(val(p.optional))
  // @ts-expect-error TypeTest
  expectType<undefined>(val(p.optional))
  // @ts-expect-error TypeTest
  expectType<undefined | string>(val(p.optional))
}
