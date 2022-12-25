import type Project from '@theatre/core/projects/Project'
import {val} from '@theatre/dataverse'

export default function getAllPossibleAssetIDs(project: Project) {
  const sheets = Object.values(val(project.pointers.historic.sheetsById))
  const staticValues = sheets
    .flatMap((sheet) => Object.values(sheet?.staticOverrides.byObject ?? {}))
    .flatMap((overrides) => Object.values(overrides ?? {}))
  const keyframeValues = sheets
    .flatMap((sheet) => Object.values(sheet?.sequence?.tracksByObject ?? {}))
    .flatMap((tracks) => Object.values(tracks?.trackData ?? {}))
    .flatMap((track) => track?.keyframes)
    .map((keyframe) => keyframe?.value)

  const allValues = [...staticValues, ...keyframeValues].filter(
    // value is string, and is unique
    (value, index, self) =>
      typeof value === 'string' && self.indexOf(value) === index,
  ) as string[]

  return allValues
}
