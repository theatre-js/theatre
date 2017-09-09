// @flow
import MapOfReferences from './MapOfReferences'
import Reference from './Reference'
import referencifyDeep from './referencifyDeep'

describe('DataVerse.MapOfReferences', () => {
  it('should work', () => {
    const initialValue = {foo: new Reference('foo'), bar: referencifyDeep({a: 1, b: 2, c: {baz: 'baz'}})}
    const map = new MapOfReferences(initialValue)

    map.set('foo', new Reference('foo2'))
    expect(map.unboxDeep()).toMatchObject({foo: 'foo2'})
    const diffs = []
    map.diffs().tap((diff) => {diffs.push(diff)})
    map.get('foo').set('foo3')
    expect(diffs).toHaveLength(1)
    expect(diffs[0]).toMatchObject({address: ['foo'], oldValue: 'foo2', newValue: 'foo3'})
    map.get('bar').get('c').get('baz').set('baz2')
    expect(diffs[1]).toMatchObject({address: ['bar', 'c', 'baz'], oldValue: 'baz', newValue: 'baz2'})
  })
})