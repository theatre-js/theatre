import box from './box'
import atomifyDeep from './atomifyDeep'

describe('DataVerse.atoms.dict', () => {
  let o: $FixMe
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
    const changes: $FixMe[] = []
    o.changes().tap((change: $FixMe) => {
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
  
})
