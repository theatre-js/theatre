import {tightJsonStringify} from './tightJsonStringify'
describe('tightJsonStringify', () => {
  it('matches a series of expectations', () => {
    expect(tightJsonStringify({a: 1, b: 2, c: {y: 4, z: 745}}))
      .toMatchInlineSnapshot(`
      "{ "a": 1,
        "b": 2,
        "c": {
          "y": 4,
          "z": 745 } }"
    `)
    expect(tightJsonStringify(true)).toMatchInlineSnapshot(`"true"`)
    expect(tightJsonStringify('Already a string')).toMatchInlineSnapshot(
      `""Already a string""`,
    )
    expect(tightJsonStringify({a: 1, b: {c: [1, 2, {d: 4}], e: 8}}))
      .toMatchInlineSnapshot(`
      "{ "a": 1,
        "b": {
          "c": [
            1,
            2,
            { "d": 4 } ],
          "e": 8 } }"
    `)
  })
})
