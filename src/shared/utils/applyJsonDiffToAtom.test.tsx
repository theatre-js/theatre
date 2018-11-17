// fast-json-patch does't seem to be spec-compliant.
// it can't convert arrays to objects and vice-versa
import applyJsonDiffToAtom from './applyJsonDiffToAtom'
import atomifyDeep from '$shared/DataVerse/atomsDeprecated/atomifyDeep'
import jiff from 'jiff'

const example = (input: {}, output: {}, debug: boolean = false) => {
  const diffs: Array<Object> = jiff.diff(input, output, {invertible: false})
  // const diffs: Array<Object> = jsonPatchLib.compare(input, output)
  const atom = atomifyDeep(input)

  return it(`Case: ${JSON.stringify(input)} ==> ${JSON.stringify(
    output,
  )}`, () => {
    if (debug) debugger
    // console.log('diffs', diffs)
    for (const diff of diffs) {
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
  example({foo: {}}, {foo: []})
  example({foo: [0]}, {foo: {one: 'valueOfOne'}})
})
