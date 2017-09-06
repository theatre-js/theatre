// @flow
import {default as referencifyDeep, type ReferencifyDeepObject} from './referencifyDeep'
import * as D from './index'

describe('DataVerse.referencifyDeep', () => {
  it('shoudl work', () => {
    expect(referencifyDeep('hi').unboxDeep()).toEqual('hi')
    expect(referencifyDeep({}).unboxDeep()).toMatchObject({})
    expect(referencifyDeep({a: 'a'}).unboxDeep()).toMatchObject({a: 'a'})
    expect(referencifyDeep({a: 'a', b: {a: {b: 'hi'}}}).unboxDeep()).toMatchObject({a: 'a', b: {a: {b: 'hi'}}})

    const ref = referencifyDeep({a: 'a', b: {c: 2, d: new Error()}});
    (ref.get('b').get('d').get(): Error)
    expect(ref.get('a').get()).toEqual('a')
    expect(ref.get('b').isReference).toEqual(true)
    expect(ref.get('b').get('c').get()).toEqual(2)
    expect(ref.get('b').get('d').get()).toBeInstanceOf(Error)
  })

  function typeTests() { // eslint-disable-line no-unused-vars
    (referencifyDeep({a: 'foo'}): D.MapOfReferences<{a: D.Reference<string>}>);
    // $FlowExpectError
    (referencifyDeep({a: 'foo'}): D.MapOfReferences<{a: D.Reference<number>}>);
    (referencifyDeep({a: 'foo', b: 12}): D.MapOfReferences<{a: D.Reference<string>, b: D.Reference<number>}>);
    // $FlowExpectError
    (referencifyDeep({a: 'foo', b: 12}): D.MapOfReferences<{a: D.Reference<string>}>);
    (referencifyDeep({a: 'foo', b: {bar: 'bar', baz: true}}): D.MapOfReferences<{a: D.Reference<string>, b: D.MapOfReferences<{bar: D.Reference<string>, baz: D.Reference<boolean>}>}>);

    type A = {a: string, b: number, c: boolean}
    type AR = ReferencifyDeepObject<A>
    (referencifyDeep({a: 'hi', b: 10, c: true}): AR)
  }
})