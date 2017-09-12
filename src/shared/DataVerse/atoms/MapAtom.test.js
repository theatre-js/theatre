// @flow
import MapAtom from './MapAtom'
import Atom from './Atom'
import atomifyDeep from './atomifyDeep'

describe('DataVerse.MapAtom', () => {
  let o
  beforeEach(() => {
    o = atomifyDeep({foo: 'foo', bar: 'bar', obj: {str: 'str', innerObj: {a: 1, b: [1, 2, 3]}}})
  })
  it('should allow getting and setting values', () => {
    expect(o.get('foo').get()).toEqual('foo')
    o.set('foo', new Atom('foo2'))
    expect(o.get('foo').get()).toEqual('foo2')
  })
  it('should allow correctly set itself as parent of inner children', () => {
    // $FlowIgnore
    expect(o.get('foo')._parent).toEqual(o)
    const foo2 = new Atom('foo2')
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

    const foo2 = new Atom('foo2')
    o.set('foo', foo2)
    expect(changes).toHaveLength(2)
    expect(changes[1].foo).toEqual(foo2)

    o.set('bar', new Atom('bar2'))
    expect(changes).toHaveLength(3)

    o.get('bar').set('bar3')
    expect(changes).toHaveLength(3)

    o.get('obj').set('str', new Atom('str2'))
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
      newRefs: {},
    })
    // $FixMe
    expect(deepChanges[0].newRefs.foo).toEqual(oldFoo)

    const foo2 = new Atom('foo2')
    o.set('foo', foo2)
    expect(deepChanges).toHaveLength(2)
    // $FixMe
    expect(deepChanges[1].newRefs.foo).toEqual(foo2)

    o.set('bar', new Atom('bar2'))
    expect(deepChanges).toHaveLength(3)

    o.get('bar').set('bar3')
    expect(deepChanges).toHaveLength(4)
    expect(deepChanges[3]).toMatchObject({address: ['bar'], newValue: 'bar3'})

    o.get('obj').set('str', new Atom('str2'))
    expect(deepChanges).toHaveLength(3)
  })
  // it('should work', () => {
  //   const initialValue = {foo: new Atom('foo'), bar: atomifyDeep({a: 1, b: 2, c: {baz: 'baz'}})}
  //   const map = new MapAtom(initialValue)

  //   map.set('foo', new Atom('foo2'))
  //   expect(map.unboxDeep()).toMatchObject({foo: 'foo2'})
  //   const deepDiffs = []
  //   map.deepDiffs().tap((diff) => {
  //       console.log('difsf', diff)
  //       deepDiffs.push(diff)
  //   })
  //   map.get('foo').set('foo3')
  //   expect(deepDiffs).toHaveLength(1)
  //   expect(deepDiffs[0]).toMatchObject({address: ['foo'], oldValue: 'foo2', newValue: 'foo3'})
  //   map.get('bar').get('c').get('baz').set('baz2')
  //   expect(deepDiffs[1]).toMatchObject({address: ['bar', 'c', 'baz'], oldValue: 'baz', newValue: 'baz2'})
  // })
})