import boxAtom, {BoxAtom} from './boxAtom'
import atomifyDeep from './atomifyDeep'
import {DictAtom, IDictAtomChangeType} from './dictAtom'
import {ArrayAtom} from './arrayAtom'

describe('DataVerse.atoms.dict', () => {
  type DictAtomType = DictAtom<{
    foo: BoxAtom<string>
    bar: BoxAtom<string>
    obj: DictAtom<{
      str: BoxAtom<string>
      innerObj: DictAtom<{
        a: BoxAtom<number>
        b: ArrayAtom<BoxAtom<number>>
      }>
    }>
  }>
  let o: DictAtomType
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
    o.setProp('foo', boxAtom('foo2'))
    expect(o.prop('foo').getValue()).toEqual('foo2')
  })
  describe(`clear()`, () => {
    it(`should work`, () => {
      o.clear()
      expect(o.keys()).toHaveLength(0)
    })
  })
  it('should allow correctly set itself as parent of inner children', () => {
    expect(o.prop('foo').getParent()).toEqual(o)
    const foo2 = boxAtom('foo2')
    o.setProp('foo', foo2)
    expect(foo2.getParent()).toEqual(o)
  })

  it('should correctly report changes', () => {
    const changes: IDictAtomChangeType<
      DictAtomType extends DictAtom<infer O> ? O : never
    >[] = []
    o.changes().tap(change => {
      changes.push(change)
    })

    const oldFoo = o.prop('foo')
    o.setProp('foo', oldFoo)
    expect(changes).toHaveLength(1)
    expect(changes[0].overriddenRefs.foo).toEqual(oldFoo)

    const foo2 = boxAtom('foo2')
    o.setProp('foo', foo2)
    expect(changes).toHaveLength(2)
    expect(changes[1].overriddenRefs.foo).toEqual(foo2)

    o.setProp('bar', boxAtom('bar2'))
    expect(changes).toHaveLength(3)

    o.prop('bar').set('bar3')
    expect(changes).toHaveLength(3)

    o.prop('obj').setProp('str', boxAtom('str2'))
    expect(changes).toHaveLength(3)

    o.deleteProp('obj')
    expect(changes).toHaveLength(4)
    expect(changes[3]).toMatchObject({overriddenRefs: {}, deletedKeys: ['obj']})
  })
})
