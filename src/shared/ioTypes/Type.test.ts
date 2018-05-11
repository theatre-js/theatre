import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertFailure } from './testHelpers'
import { right } from 'fp-ts/lib/Either'

describe('Type', () => {
  it('pipe', () => {
    const AOI = t.string
    const BAA = new t.Type<number, string, string>(
      'BAA',
      t.number.is,
      (s, c) => {
        const n = parseFloat(s)
        return isNaN(n) ? t.failure(s, c) : t.success(n)
      },
      n => String(n)
    )
    const T = AOI.pipe(BAA, 'T')
    assert.deepEqual(T.decode('1'), right(1))
    assertFailure(T.decode('a'), ['Invalid value "a" supplied to : T'])
  })
})
