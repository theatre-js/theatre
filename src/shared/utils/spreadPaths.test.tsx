import spreadPaths from './spreadPaths'
import * as assert from 'assert'
describe(`spreadPaths()`, () => {
  it(`should work`, () => {
    const source = {a: 'a', b: {b2: 'b2', b3: 'b3'}}
    const target = {a: 'aOld', c: 'cOld'}
    Object.freeze(target)
    const result = spreadPaths([['a'], ['b', 'b2']], source, target)
    const expected = {
      a: 'a',
      b: {b2: 'b2'},
      c: 'cOld',
    }
    assert.deepStrictEqual(result, expected)
  })
})
