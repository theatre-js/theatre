import {TPointCoords} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {TTransformedSelectedArea} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'

export const shouldToggleIsInSelection = (
  pointCoords: TPointCoords,
  isCurrentlyInSelection: boolean,
  selectedArea: TTransformedSelectedArea[0],
): boolean => {
  let shouldToggle = false
  if (selectedArea == null) {
    if (isCurrentlyInSelection) {
      shouldToggle = true
    }
  } else {
    const {time, value} = pointCoords
    const {left, top, right, bottom} = selectedArea
    if (left <= time && time <= right && top <= value && value <= bottom) {
      if (!isCurrentlyInSelection) {
        shouldToggle = true
      }
    } else {
      if (isCurrentlyInSelection) {
        shouldToggle = true
      }
    }
  }

  return shouldToggle
}
