import {
  TPointValuesEditorProps,
  TPointContextMenuProps,
  TConnectorContextMenuProps,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import {
  TPointCoords,
  TPointSingleHandle,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
// import {TPointData} from '$tl/ui/panels/AllInOnePanel/Right/selection/types'

export type TShowPointValuesEditor = (
  props: Pick<
    TPointValuesEditorProps,
    'initialValue' | 'initialTime' | 'top' | 'left' | 'pointIndex'
  >,
) => void

export type TShowPointContextMenu = (
  props: Pick<TPointContextMenuProps, 'left' | 'top' | 'pointIndex'>,
) => void

export type TShowConnectorContextMenu = (
  props: Pick<TConnectorContextMenuProps, 'left' | 'top' | 'pointIndex'>,
) => void

// export type TAddPointToSelection = (
//   pointIndex: number,
//   pointData: TPointData,
// ) => void

export type TRemovePointFromSelection = (pointIndex: number) => void

export type TMovePointToNewCoords = (
  pointIndex: number,
  originalCoords: TPointCoords,
  change: TPointCoords,
) => void

export type TMoveSingleHandle = (
  pointIndex: number,
  newHandle: TPointSingleHandle,
) => void

export type TFnNeedsPointIndex = (pointIndex: number) => void

export type TMoveDopesheetConnector = (
  pointIndex: number,
  moveAmount: number,
) => void
