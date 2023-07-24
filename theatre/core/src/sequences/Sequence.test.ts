/*
 * @jest-environment jsdom
 */
import {setupTestSheet} from '@theatre/shared/testUtils'
import {encodePathToProp} from '@theatre/shared/utils/addresses'
import {asKeyframeId, asSequenceTrackId} from '@theatre/shared/utils/ids'
import type {ObjectAddressKey, SequenceTrackId} from '@theatre/shared/utils/ids'

describe(`Sequence`, () => {
  test('sequence.getKeyframesOfSimpleProp()', async () => {
    const {objPublicAPI, sheet} = await setupTestSheet({
      staticOverrides: {
        byObject: {},
      },
      sequence: {
        type: 'PositionalSequence',
        length: 20,
        subUnitsPerUnit: 30,
        tracksByObject: {
          ['obj' as ObjectAddressKey]: {
            trackIdByPropPath: {
              [encodePathToProp(['position', 'y'])]: asSequenceTrackId('1'),
            },
            trackData: {
              ['1' as SequenceTrackId]: {
                type: 'BasicKeyframedTrack',
                keyframes: [
                  {
                    id: asKeyframeId('0'),
                    position: 10,
                    connectedRight: true,
                    handles: [0.5, 0.5, 0.5, 0.5],
                    type: 'bezier',
                    value: 3,
                  },
                  {
                    id: asKeyframeId('1'),
                    position: 20,
                    connectedRight: false,
                    handles: [0.5, 0.5, 0.5, 0.5],
                    type: 'bezier',
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

    const keyframes = seq.__experimental_getKeyframes(
      objPublicAPI.props.position.y,
    )
    expect(keyframes).toHaveLength(2)
    expect(keyframes[0].value).toEqual(3)
    expect(keyframes[1].value).toEqual(6)
    expect(keyframes[0].position).toEqual(10)
  })
})
