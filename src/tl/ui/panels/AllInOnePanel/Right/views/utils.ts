import {IPointCoords} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {ITransformedSelectedArea} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'

export const shouldToggleIsInSelection = (
  pointCoords: IPointCoords,
  isCurrentlyInSelection: boolean,
  selectedArea: ITransformedSelectedArea[0],
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
