/**
 * @jest-environment jsdom
 */
import {setupTestSheet} from '@theatre/shared/testUtils'
import {encodePathToProp} from '@theatre/shared/utils/addresses'
import {asKeyframeId, asSequenceTrackId} from '@theatre/shared/utils/ids'
import {iterateOver, prism, val} from '@theatre/dataverse'

describe(`SheetObject`, () => {
  test('it should support setting/unsetting static props', async () => {
    const {obj, studio} = await setupTestSheet({
      staticOverrides: {
        byObject: {
          obj: {
            position: {
              x: 10,
            },
          },
        },
      },
    })

    const objValues = iterateOver(
      prism(() => {
        return val(val(obj.getValues()))
      }),
    )

    expect(objValues.next().value).toMatchObject({
      position: {x: 10, y: 1, z: 2},
    })

    // setting a static
    studio.transaction(({set}) => {
      set(obj.propsP.position.y, 5)
    })

    expect(objValues.next().value).toMatchObject({
      position: {x: 10, y: 5, z: 2},
    })

    // unsetting a static
    studio.transaction(({unset}) => {
      unset(obj.propsP.position.y)
    })

    expect(objValues.next().value).toMatchObject({
      position: {x: 10, y: 1, z: 2},
    })

    objValues.return()
  })

  test('it should support sequenced props', async () => {
    const {obj, sheet} = await setupTestSheet({
      staticOverrides: {
        byObject: {},
      },
      sequence: {
        type: 'PositionalSequence',
        length: 20,
        subUnitsPerUnit: 30,
        tracksByObject: {
          obj: {
            trackIdByPropPath: {
              [encodePathToProp(['position', 'y'])]: asSequenceTrackId('1'),
            },
            trackData: {
              '1': {
                type: 'BasicKeyframedTrack',
                keyframes: [
                  {
                    id: asKeyframeId('0'),
                    position: 10,
                    connectedRight: true,
                    handles: [0.5, 0.5, 0.5, 0.5],
                    value: 3,
                  },
                  {
                    id: asKeyframeId('1'),
                    position: 20,
                    connectedRight: false,
                    handles: [0.5, 0.5, 0.5, 0.5],
                    value: 6,
                  },
                ],
              },
            },
          },
        },
      },
    })

    const seq = sheet.publicApi.sequence

    const objValues = iterateOver(
      prism(() => {
        return val(val(obj.getValues()))
      }),
    )

    expect(seq.position).toEqual(0)

    expect(objValues.next().value).toMatchObject({
      position: {x: 0, y: 3, z: 2},
    })

    seq.position = 5
    expect(seq.position).toEqual(5)
    expect(objValues.next().value).toMatchObject({
      position: {x: 0, y: 3, z: 2},
    })

    seq.position = 11
    expect(objValues.next().value).toMatchObject({
      position: {x: 0, y: 3.29999747758308, z: 2},
    })

    seq.position = 15
    expect(objValues.next().value).toMatchObject({
      position: {x: 0, y: 4.5, z: 2},
    })

    seq.position = 22
    expect(objValues.next().value).toMatchObject({
      position: {x: 0, y: 6, z: 2},
    })

    objValues.return()
  })
})
