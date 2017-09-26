// @flow
// import ArrayAtom from './ArrayAtom'
import BoxAtom from './BoxAtom'
import atomifyDeep from './atomifyDeep'

describe('DataVerse.ArrayAtom', () => {
  it('should allow initial values', () => {
    const o = atomifyDeep([1, 2, 3])
    expect(o.index(0).getValue()).toEqual(1)
    expect(o.index(1).getValue()).toEqual(2)
    expect(o.index(2).getValue()).toEqual(3)
  })


  it('should allow correctly set itself as parent of inner children', () => {
    const o = atomifyDeep([1, 2, 3])

    expect(o.index(1).getParent()).toEqual(o)

    const foo2 = new BoxAtom(2)
    o.setIndex(2, foo2)
    expect(foo2.getParent()).toEqual(o)
  })
  it('should correctly report changes', () => {
    const o = atomifyDeep([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    const changes = []
    o.changes().tap((change) => {changes.push(change)})
    const the1 = o.index(1)

    o.setIndex(1, the1)
    expect(changes).toHaveLength(1)
    expect(changes[0].addedRefs[0]).toEqual(the1)

    const the11 = new BoxAtom(11)
    const the9 = o.index(9)
    o.splice(1, 2, [the11, new BoxAtom(12), new BoxAtom(13)])

    expect(changes).toHaveLength(2)
    expect(changes[1]).toMatchObject({
      startIndex: 1,
      deleteCount: 2,
    })
  })
  it('should correctly report deep changes', () => {
    const o = atomifyDeep([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    const deepChanges = []
    o.deepChanges().tap((change) => {deepChanges.push(change)})
    const the0 = o.index(0)
    const the1 = o.index(1)

    o.setIndex(1, the1)
    expect(deepChanges).toHaveLength(1)

    expect(deepChanges[0].addedRefs[0]).toEqual(the1)

    const theNewOne = new BoxAtom(11)
    const the9 = o.index(9)
    o.splice(1, 2, [theNewOne, new BoxAtom(12), new BoxAtom(13)])

    expect(deepChanges).toHaveLength(2)
    expect(deepChanges[1]).toMatchObject({
      type: 'ArrayChange',
      startIndex: 1,
      deleteCount: 2,
    })

    the1.set('whateer')
    expect(deepChanges).toHaveLength(2)

    the9.set('blah')
    expect(deepChanges).toHaveLength(3)
    expect(deepChanges[2]).toMatchObject({
      type: 'BoxChange',
      address: [10],
    })

    the0.set('blah')
    expect(deepChanges).toHaveLength(4)
    expect(deepChanges[3]).toMatchObject({
      type: 'BoxChange',
      address: [0],
    })

    theNewOne.set('blahs')
    expect(deepChanges).toHaveLength(5)
    expect(deepChanges[4]).toMatchObject({
      type: 'BoxChange',
      address: [1],
    })
  })
  it('should correctly report deep diffs', () => {
    const o = atomifyDeep([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    const deepDiffs = []
    o.deepDiffs().tap((change) => {deepDiffs.push(change)})

    o.splice(1, 2, [new BoxAtom(11), new BoxAtom(12), new BoxAtom(13)])

    expect(deepDiffs).toHaveLength(1)
    expect(deepDiffs[0]).toMatchObject({
      type: 'ArrayDiff',
      startIndex: 1,
      deepUnboxOfDeletedRows: [1, 2],
      deepUnboxOfAddedRows: [11, 12, 13],
    })
  })
})