import {setupTestSheet} from '@theatre/shared/testUtils'
import {encodePathToProp} from '@theatre/utils/pathToProp'
import type {
  ObjectAddressKey,
  SequenceTrackId,
} from '@theatre/sync-server/state/types/core'
import type {$IntentionalAny} from '@theatre/utils/types'
import {iterateOver} from '@theatre/dataverse'
import {asSequenceTrackId} from '@theatre/shared/utils/ids'

describe(`SheetObjectTemplate`, () => {
  describe(`getArrayOfValidSequenceTracks()`, () => {
    it('should only include valid tracks', async () => {
      const {obj} = await setupTestSheet({
        staticOverrides: {
          byObject: {},
        },
        sequence: {
          type: 'PositionalSequence',
          subUnitsPerUnit: 30,
          // length: 10,
          tracksByObject: {
            ['obj' as ObjectAddressKey]: {
              trackIdByPropPath: {
                [encodePathToProp(['position', 'x'])]: asSequenceTrackId('x'),
                [encodePathToProp(['position', 'invalid'])]:
                  asSequenceTrackId('invalidTrack'),
              },
              trackData: {
                ['x' as SequenceTrackId]: null as $IntentionalAny,
                ['invalid' as SequenceTrackId]: null as $IntentionalAny,
              },
            },
          },
        },
      })

      const iter = iterateOver(obj.template.getArrayOfValidSequenceTracks())

      const validTracks = iter.next().value
      expect(validTracks).toHaveLength(1)
      expect(validTracks).toMatchObject([
        {
          pathToProp: ['position', 'x'],
          trackId: 'x',
        },
      ])
    })

    it('should return empty array when no tracks are set up', async () => {
      const {obj} = await setupTestSheet({
        staticOverrides: {
          byObject: {},
        },
        sequence: {
          type: 'PositionalSequence',
          tracksByObject: {},
        },
      })
      const iter = iterateOver(obj.template.getArrayOfValidSequenceTracks())

      expect(iter.next().value).toHaveLength(0)
    })
  })
  describe(`getMapOfValidSequenceTracks_forStudio()`, () => {
    it('should return valid sequences in map form', async () => {
      const {obj} = await setupTestSheet({
        staticOverrides: {
          byObject: {},
        },
        sequence: {
          type: 'PositionalSequence',
          subUnitsPerUnit: 30,
          length: 10,
          tracksByObject: {
            ['obj' as ObjectAddressKey]: {
              trackIdByPropPath: {
                [encodePathToProp(['position', 'x'])]: asSequenceTrackId('x'),
                [encodePathToProp(['position', 'invalid'])]:
                  asSequenceTrackId('invalidTrack'),
              },
              trackData: {
                ['x' as SequenceTrackId]: null as $IntentionalAny,
                ['invalid' as SequenceTrackId]: null as $IntentionalAny,
              },
            },
          },
        },
      })

      const iter = iterateOver(
        obj.template.getMapOfValidSequenceTracks_forStudio(),
      )

      const validTracks = iter.next().value
      expect(validTracks).toMatchObject({
        position: {
          x: 'x',
        },
      })
    })
  })
})
