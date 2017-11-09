// @flow
import box from './box'
import atomifyDeep from './atomifyDeep'
import * as D from '$shared/DataVerse'

describe('DataVerse.atoms.dict', () => {
  let o: D.IDictAtom<{
    foo: D.IBoxAtom<string>,
    bar: D.IBoxAtom<string>,
    obj: D.IDictAtom<{
      str: D.IBoxAtom<string>,
      innerObj: D.IDictAtom<{
        a: D.IBoxAtom<number>,
        b: D.IArrayAtom<D.IBoxAtom<number>>,
      }>,
    }>,
  }>
  beforeEach(() => {
    o = atomifyDeep({
      foo: 'foo',
      bar: 'bar',
      obj: {
        str: 'str',
        innerObj: {
          a: 1,
          b: [1, 2, 3],
        },
      },
    })
  })
  it('should allow getting and setting values', () => {
    expect(o.prop('foo').getValue()).toEqual('foo')
    o.setProp('foo', box('foo2'))
    expect(o.prop('foo').getValue()).toEqual('foo2')
  })
  it('should allow correctly set itself as parent of inner children', () => {
    expect(o.prop('foo').getParent()).toEqual(o)
    const foo2 = box('foo2')
    o.setProp('foo', foo2)
    expect(foo2.getParent()).toEqual(o)
  })

  it('should correctly report changes', () => {
    const changes = []
    o.changes().tap(change => {
      changes.push(change)
    })

    const oldFoo = o.prop('foo')
    o.setProp('foo', oldFoo)
    expect(changes).toHaveLength(1)
    expect(changes[0].overriddenRefs.foo).toEqual(oldFoo)

    const foo2 = box('foo2')
    o.setProp('foo', foo2)
    expect(changes).toHaveLength(2)
    expect(changes[1].overriddenRefs.foo).toEqual(foo2)

    o.setProp('bar', box('bar2'))
    expect(changes).toHaveLength(3)

    o.prop('bar').set('bar3')
    expect(changes).toHaveLength(3)

    o.prop('obj').setProp('str', box('str2'))
    expect(changes).toHaveLength(3)

    o.deleteProp('obj')
    expect(changes).toHaveLength(4)
    expect(changes[3]).toMatchObject({overriddenRefs: {}, deletedKeys: ['obj']})
  })
  it('should correctly report deep changes', () => {
    const deepChanges = []
    o.deepChanges().tap(change => {
      deepChanges.push(change)
    })

    const oldFoo = o.prop('foo')
    o.setProp('foo', oldFoo)
    expect(deepChanges).toHaveLength(1)
    expect(deepChanges[0]).toMatchObject({
      address: [],
      type: 'MapChange',
    })

    expect(deepChanges[0].overriddenRefs.foo).toEqual(oldFoo)

    const foo2 = box('foo2')
    o.setProp('foo', foo2)
    expect(deepChanges).toHaveLength(2)

    expect(deepChanges[1].overriddenRefs.foo).toEqual(foo2)

    o.setProp('bar', box('bar2'))
    expect(deepChanges).toHaveLength(3)

    o.prop('bar').set('bar3')
    expect(deepChanges).toHaveLength(4)
    expect(deepChanges[3]).toMatchObject({
      type: 'BoxChange',
      address: ['bar'],
      newValue: 'bar3',
    })

    o
      .prop('obj')
      .prop('str')
      .set('str2')
    expect(deepChanges).toHaveLength(5)
    expect(deepChanges[4]).toMatchObject({
      type: 'BoxChange',
      address: ['obj', 'str'],
    })

    o.deleteProp('obj')
    expect(deepChanges).toHaveLength(6)
    expect(deepChanges[5]).toMatchObject({
      overriddenRefs: {},
      deletedKeys: ['obj'],
    })
  })

  it('should correctly report deep diffs', () => {
    const deepDiffs = []
    o.deepDiffs().tap(change => {
      deepDiffs.push(change)
    })

    const oldFoo = o.prop('foo')
    o.setProp('foo', oldFoo)
    expect(deepDiffs).toHaveLength(1)
    expect(deepDiffs[0]).toMatchObject({
      address: [],
      type: 'MapDiff',
      deepUnboxOfOldRefs: {foo: 'foo'},
      deepUnboxOfNewRefs: {foo: 'foo'},
    })

    const foo2 = box('foo2')
    o.setProp('foo', foo2)
    expect(deepDiffs).toHaveLength(2)
    expect(deepDiffs[1]).toMatchObject({
      address: [],
      type: 'MapDiff',
      deepUnboxOfOldRefs: {foo: 'foo'},
      deepUnboxOfNewRefs: {foo: 'foo2'},
    })

    o.setProp('bar', box('bar2'))
    expect(deepDiffs).toHaveLength(3)

    o.prop('bar').set('bar3')
    expect(deepDiffs).toHaveLength(4)
    expect(deepDiffs[3]).toMatchObject({
      type: 'BoxDiff',
      address: ['bar'],
      newValue: 'bar3',
      oldValue: 'bar2',
    })

    o
      .prop('obj')
      .prop('str')
      .set('str2')
    expect(deepDiffs).toHaveLength(5)
    expect(deepDiffs[4]).toMatchObject({
      type: 'BoxDiff',
      address: ['obj', 'str'],
      oldValue: 'str',
      newValue: 'str2',
    })

    o.deleteProp('foo')
    expect(deepDiffs).toHaveLength(6)
    expect(deepDiffs[5]).toMatchObject({
      deepUnboxOfOldRefs: {foo: 'foo2'},
      deletedKeys: ['foo'],
    })
  })
})
