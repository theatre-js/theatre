// @flow
import jsonPatchLib from 'fast-json-patch'
import * as D from '$shared/DataVerse'
import applyJsonDiffToAtom from './applyJsonDiffToAtom'

const example = (input, output) => {
  const diffs: Array<Object> = jsonPatchLib.compare(input, output)
  const atom = D.atoms.atomifyDeep(input)

  return it(`Case: ${JSON.stringify(input)} ==> ${JSON.stringify(
    output,
  )}`, () => {
    // console.log('diffs', diffs)
    for (let diff of diffs) {
      applyJsonDiffToAtom(diff, atom)
    }

    expect(JSON.stringify(atom.unboxDeep())).toEqual(JSON.stringify(output))
  })
}

describe('applyJsonDiffToAtom', () => {
  example({foo: 'foo'}, {foo: 'bar'})
  example({foo: 'foo'}, {})
  example({foo: 'foo'}, {foo: undefined})
  example({foo: 'foo'}, {foo: null})
  example({foo: 'foo'}, {foo: 'foo', bar: 'bar'})
  example({foo: [0, 1, 2]}, {foo: [0, 2]})
  example({foo: [0, 1, 2]}, {foo: [0, 2, 3, 4]})
  example({foo: []}, {foo: [0]})
})
