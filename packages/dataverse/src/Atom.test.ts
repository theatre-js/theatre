// eslint-disable-next-line import/no-extraneous-dependencies
import {Atom} from '@theatre/dataverse'

describe(`Atom`, () => {
  test(`Usage of Atom and pointer, without prism`, async () => {
    const data = {foo: 'foo', bar: 0}
    const atom = new Atom(data)

    // atom.get() returns an exact reference to the data
    expect(atom.get()).toBe(data)

    atom.set({foo: 'foo', bar: 1})

    expect(atom.get()).not.toBe(data)
    expect(atom.get()).toEqual({foo: 'foo', bar: 1})

    atom.reduce(({foo, bar}) => ({foo, bar: bar + 1}))
    expect(atom.get()).toEqual({foo: 'foo', bar: 2})

    atom.setByPointer((p) => p.bar, 3)
    expect(atom.get()).toEqual({foo: 'foo', bar: 3})

    atom.setByPointer((p) => p.foo, 'foo2')
    expect(atom.get()).toEqual({foo: 'foo2', bar: 3})

    // this would work in runtime, but typescript will complain because `baz` is not a property of the state
    // let's silence the error for the sake of the test
    // @ts-ignore
    atom.setByPointer((p) => p.baz, 'baz')
    expect(atom.get()).toEqual({foo: 'foo2', bar: 3, baz: 'baz'})

    atom.setByPointer((p) => p, {foo: 'newfoo', bar: -1})
    expect(atom.get()).toEqual({foo: 'newfoo', bar: -1})

    // `getByPointer()` is to `get()` what `setByPointer()` is to `set()`
    expect(atom.getByPointer((p) => p.bar)).toBe(-1)

    // `reduceByPointer()` is to `setByPointer()` what `reduce()` is to `set()`
    atom.reduceByPointer(
      (p) => p.bar,
      (bar) => bar + 1,
    )

    expect(atom.get()).toEqual({foo: 'newfoo', bar: 0})

    // we can use external pointers too
    const externalPointer = atom.pointer.bar
    atom.setByPointer(() => externalPointer, 1)
    expect(atom.get()).toEqual({foo: 'newfoo', bar: 1})

    let internalPointer
    // the pointer passed to `setByPointer()` is the same as the one returned by `atom.pointer`
    atom.setByPointer((p) => {
      internalPointer = p
      return p.bar
    }, 2)

    expect(internalPointer).toBe(atom.pointer)

    expect(atom.pointer).toBe(atom.pointer)
    expect(atom.pointer.bar).toBe(atom.pointer.bar)

    // pointers don't change when the atom's state changes
    const oldPointer = atom.pointer.bar
    atom.set({foo: 'foo', bar: 10})
    expect(atom.pointer.bar).toBe(oldPointer)
  })
})
