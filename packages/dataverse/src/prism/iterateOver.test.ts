/*
 * @jest-environment jsdom
 */
import Atom from '../Atom'
import iterateOver from './iterateOver'

describe(`iterateOver()`, () => {
  test('it should work', () => {
    const a = new Atom(0)
    let iter = iterateOver(a.pointer)
    expect(iter.next().value).toEqual(0)
    a.set(1)
    a.set(2)
    expect(iter.next()).toMatchObject({value: 2, done: false})
    iter.return()
    iter = iterateOver(a.pointer)
    expect(iter.next().value).toEqual(2)
    a.set(3)
    expect(iter.next()).toMatchObject({done: false, value: 3})
    iter.return()
  })
})
