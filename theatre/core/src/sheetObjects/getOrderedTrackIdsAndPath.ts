import {
  getPropConfigByPath,
  isPropConfigComposite,
} from '@theatre/shared/propTypes/utils'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {StrictRecord} from '@theatre/shared/utils/types'
import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'

export type IdsArray = Array<{
  pathToProp: PathToProp
  trackId: SequenceTrackId
}>

/**
 * Iterates through a tree of properties and returns the path and trackId
 * if the trackId exists (i.e. is sequenced), sorted by compound root props last
 *
 * Returns an array.
 */
export default function getOrderedTrackIdsAndPaths({
  trackIdByPropPath,
  tracks,
  pathToProp,
  config,
  subProp,
}: {
  trackIdByPropPath: StrictRecord<string, string>
  tracks: IdsArray
  pathToProp: PathToProp
  config: PropTypeConfig_Compound<{}>
  subProp?: PropTypeConfig_Compound<{}>
}): IdsArray {
  const propKeys = Object.keys(subProp?.props || config.props)

  for (const propKey of propKeys) {
    const updatedPathToProp = [...pathToProp, propKey]
    const subProp = getPropConfigByPath(config, updatedPathToProp)

    if (subProp?.type === 'compound') {
      getOrderedTrackIdsAndPaths({
        config,
        subProp,
        trackIdByPropPath,
        tracks,
        pathToProp: updatedPathToProp,
      })
    } else {
      const trackId = trackIdByPropPath[JSON.stringify(updatedPathToProp)]

      if (trackId) {
        tracks.push({
          pathToProp: updatedPathToProp,
          trackId,
        })
      }
    }
  }

  tracks.sort((a, b) => {
    const [keyA] = a.pathToProp
    const [keyB] = b.pathToProp
    const configA = getPropConfigByPath(config, [keyA])
    const configB = getPropConfigByPath(config, [keyB])

    if (configA && !isPropConfigComposite(configA)) {
      return -1
    }

    if (configB && isPropConfigComposite(configB)) {
      return 1
    }

    return 0
  })

  return tracks
}
