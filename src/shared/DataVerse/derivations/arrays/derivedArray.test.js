// @flow
import derivedArray from './derivedArray'

describe('DataVerse.derivations.derivedArray', () => {
  it.skip('should work', () => {
    // $FixMe
    const f = derivedArray([0, 1]).concat(derivedArray([2, 3]).concat(derivedArray([4, 5]))).concat(derivedArray([6, 7])).face()
    expect(f.getAll()).toMatchObject([0, 1, 2, 3, 4, 5])
  })
})