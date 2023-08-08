// eslint-disable-next-line import/no-extraneous-dependencies
import {pointer, getPointerParts, Atom} from '@theatre/dataverse'

describe(`pointer`, () => {
  test(`Basic useage of pointer`, async () => {
    const root = {foo: 'foo', bar: 0}
    const p = pointer({root: root, path: []})

    const parts = getPointerParts(p)
    expect(parts.root).toBe(root)
    expect(parts.path).toEqual([])

    const pointerToFoo = p.foo
    // p.foo is a pointer to the `foo` property of the root object. its only difference to p is that its path is `['foo']`
    expect(getPointerParts(pointerToFoo).path).toEqual(['foo'])
    expect(getPointerParts(pointerToFoo).root).toBe(root)

    // subPointers are cached
    expect(pointerToFoo).toBe(p.foo)

    // we can also manually construct the pointer to foo:
    const pointerToFoo2 = pointer({root: root, path: ['foo']})
    expect(getPointerParts(pointerToFoo2).path).toEqual(['foo'])
  })

  test(`Well-typed pointers`, () => {
    type Data = {str: string; foo?: {bar?: {baz: number}}}
    const root: Data = {str: 'some string'}

    // pointers bocome useful when we properly type them. Let's do that now:
    const p = pointer<Data>({
      root,
      path: [],
    })

    // or alternatively: `pointer(...) as Pointer<Data>`

    // now typescript will error if we try to access a property that doesn't exist
    // @ts-expect-error
    p.baz

    // but it will not error if we access a property that does exist
    p.foo

    // won't get an error when accessing foo.bar.baz
    p.foo.bar.baz

    // but will get an error when accessing foo.bar.baz.nonExistentProperty
    // @ts-ignore
    p.foo.bar.baz.nonExistentProperty

    // we don't need to manually type the pointer since pointers are usually provided by Atoms, and those are already typed
    const atom = new Atom(root)

    // so this  will be fine by typescript:
    atom.pointer.foo.bar.baz

    // while this will error
    // @ts-ignore
    atom.pointer.foo.bar.baz.nonExistentProperty
  })
})
