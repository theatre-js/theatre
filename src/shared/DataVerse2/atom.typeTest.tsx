import {expectType, _any} from '$shared/types'
import atom, {val} from './atom'
;() => {
  const p = atom<{foo: string; bar: number; optional?: boolean}>(_any).pointer
  expectType<string>(val(p.foo))
  // $ExpectError
  expectType<number>(val(p.foo))

  expectType<number>(val(p.bar))
  // $ExpectError
  expectType<string>(val(p.bar))

  // $ExpectError
  expectType<{}>(val(p.nonExistent))
  
  expectType<undefined | boolean>(val(p.optional))
  // $ExpectError
  expectType<boolean>(val(p.optional))
  // $ExpectError
  expectType<undefined>(val(p.optional))
  // $ExpectError
  expectType<undefined | string>(val(p.optional))

}
