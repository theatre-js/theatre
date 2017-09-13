// @flow
// import MapAtom from './MapAtom'
import BoxAtom from './BoxAtom'
import atomifyDeep from './atomifyDeep'

describe('DataVerse.MapAtom', () => {
  let o
  beforeEach(() => {
    o = atomifyDeep({foo: 'foo', bar: 'bar', obj: {str: 'str', innerObj: {a: 1, b: [1, 2, 3]}}})
  })
  it('should allow getting and setting values', () => {
    expect(o.get('foo').get()).toEqual('foo')
    o.set('foo', new BoxAtom('foo2'))
    expect(o.get('foo').get()).toEqual('foo2')
  })
  it('should allow correctly set itself as parent of inner children', () => {
    // $FlowIgnore
    expect(o.get('foo')._parent).toEqual(o)
    const foo2 = new BoxAtom('foo2')
    o.set('foo', foo2)
    expect(foo2._parent).toEqual(o)
  })
  it('should correctly report changes', () => {
    const changes = []
    o.changes().tap((change) => {changes.push(change)})

    const oldFoo = o.get('foo')
    o.set('foo', oldFoo)
    expect(changes).toHaveLength(1)
    expect(changes[0].foo).toEqual(oldFoo)

    const foo2 = new BoxAtom('foo2')
    o.set('foo', foo2)
    expect(changes).toHaveLength(2)
    expect(changes[1].foo).toEqual(foo2)

    o.set('bar', new BoxAtom('bar2'))
    expect(changes).toHaveLength(3)

    o.get('bar').set('bar3')
    expect(changes).toHaveLength(3)

    o.get('obj').set('str', new BoxAtom('str2'))
    expect(changes).toHaveLength(3)
  })
  it('should correctly report deep changes', () => {
    const deepChanges = []
    o.deepChanges().tap((change) => {deepChanges.push(change)})

    const oldFoo = o.get('foo')
    o.set('foo', oldFoo)
    expect(deepChanges).toHaveLength(1)
    expect(deepChanges[0]).toMatchObject({
      address: [],
      type: 'MapChange',
    })
    // $FixMe
    expect(deepChanges[0].overriddenRefs.foo).toEqual(oldFoo)

    const foo2 = new BoxAtom('foo2')
    o.set('foo', foo2)
    expect(deepChanges).toHaveLength(2)
    // $FixMe
    expect(deepChanges[1].overriddenRefs.foo).toEqual(foo2)

    o.set('bar', new BoxAtom('bar2'))
    expect(deepChanges).toHaveLength(3)

    o.get('bar').set('bar3')
    expect(deepChanges).toHaveLength(4)
    expect(deepChanges[3]).toMatchObject({type: 'BoxChange', address: ['bar'], newValue: 'bar3'})

    o.get('obj').get('str').set('str2')
    expect(deepChanges).toHaveLength(5)
    expect(deepChanges[4]).toMatchObject({type: 'BoxChange', address: ['obj', 'str']})
  })

  it('should correctly report deep diffs', () => {
    const deepDiffs = []
    o.deepDiffs().tap((change) => {deepDiffs.push(change)})

    const oldFoo = o.get('foo')
    o.set('foo', oldFoo)
    expect(deepDiffs).toHaveLength(1)
    expect(deepDiffs[0]).toMatchObject({
      address: [],
      type: 'MapDiff',
      deepUnboxOfOldRefs: {foo: 'foo'},
      deepUnboxOfNewRefs: {foo: 'foo'},
    })

    const foo2 = new BoxAtom('foo2')
    o.set('foo', foo2)
    expect(deepDiffs).toHaveLength(2)
    expect(deepDiffs[1]).toMatchObject({
      address: [],
      type: 'MapDiff',
      deepUnboxOfOldRefs: {foo: 'foo'},
      deepUnboxOfNewRefs: {foo: 'foo2'},
    })

    o.set('bar', new BoxAtom('bar2'))
    expect(deepDiffs).toHaveLength(3)

    o.get('bar').set('bar3')
    expect(deepDiffs).toHaveLength(4)
    expect(deepDiffs[3]).toMatchObject({type: 'BoxDiff', address: ['bar'], newValue: 'bar3', oldValue: 'bar2'})

    o.get('obj').get('str').set('str2')
    expect(deepDiffs).toHaveLength(5)
    expect(deepDiffs[4]).toMatchObject({type: 'BoxDiff', address: ['obj', 'str'], oldValue: 'str', newValue: 'str2'})
  })
})