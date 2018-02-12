import box from './box'
import atomifyDeep from './atomifyDeep'
import {ArrayAtom} from '$src/shared/DataVerse/atoms/array'
import {BoxAtom} from '$src/shared/DataVerse/atoms/box'

describe('DataVerse.atoms.array', () => {
  it('should allow initial values', () => {
    const o: ArrayAtom<BoxAtom<number>> = atomifyDeep([1, 2, 3])
    expect(o.index(0).getValue()).toEqual(1)
    expect(o.index(1).getValue()).toEqual(2)
    expect(o.index(2).getValue()).toEqual(3)
  })

  it('should allow correctly set itself as parent of inner children', () => {
    const o: ArrayAtom<BoxAtom<number>> = atomifyDeep([1, 2, 3])

    expect(o.index(1).getParent()).toEqual(o)

    const foo2 = box(2)
    o.setIndex(2, foo2)
    expect(foo2.getParent()).toEqual(o)
  })
  it('should correctly report changes', () => {
    const o: ArrayAtom<BoxAtom<number>> = atomifyDeep([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
    ])

    const changes: $FixMe[] = []
    o.changes().tap(change => {
      changes.push(change)
    })
    const the1 = o.index(1)

    o.setIndex(1, the1)
    expect(changes).toHaveLength(1)
    expect(changes[0].addedRefs[0]).toEqual(the1)

    const the11 = box(11)
    // const the9 = o.index(9)
    o.splice(1, 2, [the11, box(12), box(13)])

    expect(changes).toHaveLength(2)
    expect(changes[1]).toMatchObject({
      startIndex: 1,
      deleteCount: 2,
    })
  })
})
