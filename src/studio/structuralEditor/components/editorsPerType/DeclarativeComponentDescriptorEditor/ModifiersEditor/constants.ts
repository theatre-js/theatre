export const ACTION: {[key: string]: string} = {
  add: 'ADD',
  setType: 'SET_TYPE',
  drop: 'DROP',
  startDrag: 'START_DRAG',
  move: 'MOVE',
  cancelMove: 'CANCEL_MOVE',
}

export const STATUS: {[key: string]: string} = {
  unchanged: 'UNCHANGED',
  initialized: 'INITIALIZED',
  uninitialized: 'UNINITIALIZED',
  beingDragged: 'BEING_DRAGGED',
  dragCanceled: 'DRAG_CANCELED',
  dropped: 'DROPPED',
  moved: 'MOVED',
}

export const STATUS_BY_ACTION: {[key: string]: string} = {
  default: STATUS.unchanged,
  ADD: STATUS.uninitialized,
  SET_TYPE: STATUS.initialized,
  START_DRAG: STATUS.moving,
  CANCEL_MOVE: STATUS.dragCanceled,
  DROP: STATUS.dropped,
  MOVE: STATUS.moved,
}
