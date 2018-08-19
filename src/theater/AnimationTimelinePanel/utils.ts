import { RangeState } from "$tl/timelines/InternalTimeline";

export const getSvgWidth = (
  duration: number,
  focus: [number, number],
  boxWidth: number,
) => {
  return ((duration / (focus[1] - focus[0])) * boxWidth) | 0
}

export const timeToX = (duration: number, width: number) => (time: number) => {
  return (time * width) / duration
}

export const xToTime = (duration: number, width: number) => (x: number) => {
  return (x * duration) / width
}

export const focusedTimeToX = (focus: [number, number], width: number) => (
  time: number,
) => {
  return ((time - focus[0]) / (focus[1] - focus[0])) * width
}

export const inRangeTimeToX = (range: RangeState['rangeShownInPanel'], width: number) => (
  time: number,
) => {
  return ((time - range.from) / (range.to - range.from)) * width
}

export const xToFocusedTime = (focus: [number, number], width: number) => (
  x: number,
) => {
  return (x * (focus[1] - focus[0])) / width + focus[0]
}

export const xToInRangeTime = (range: RangeState['rangeShownInPanel'], width: number) => (
  x: number,
) => {
  return (x * (range.to - range.from)) / width + range.from
}

export const deltaXToFocusedTime = (focus: [number, number], width: number) => (
  dx: number,
) => {
  return (dx * (focus[1] - focus[0])) / width
}

export const addGlobalSeekerDragRule = () => {
  document.body.classList.add('animationTimelineSeekerDrag')
}

export const removeGlobalSeekerDragRule = () => {
  document.body.classList.remove('animationTimelineSeekerDrag')
}

export const addGlobalPointDragRule = () => {
  document.body.classList.add('pointDrag')
}

export const removeGlobalPointDragRule = () => {
  document.body.classList.remove('pointDrag')
}

export const addGlobalDopesheetDragRule = () => {
  document.body.classList.add('dopesheetDrag')
}

export const removeGlobalDopesheetDragRule = () => {
  document.body.classList.remove('dopesheetDrag')
}

export const colors = [
  {name: 'blue', normal: '#3AAFA9', darkened: '#345b59'},
  {name: 'purple', normal: '#575790', darkened: '#323253'},
  {name: 'red', normal: '#B76C6C', darkened: '#4c3434'},
  {name: 'yellow', normal: '#FCE181', darkened: '#726a4b'},
]

export const stopPropagation = (e: React.MouseEvent<$IntentionalAny>) => {
  e.stopPropagation()
}
export const disableEvent = (e: React.MouseEvent<$IntentionalAny>) => {
  e.stopPropagation()
  e.preventDefault()
}
