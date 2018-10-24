import {
  TPointValuesEditorProps,
  TPointContextMenuProps,
  TConnectorContextMenuProps,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import {
  TPointCoords,
  TPointSingleHandle,
  TNormalizedPoints,
  TNormalizedPoint,
  TExtremums,
} from '$tl/ui/panels/AllInOnePanel/Right/types'

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

export type TAddPointToSelection = (
  pointIndex: number,
  pointData: TPointCoords,
  extremums?: TExtremums,
) => void

export type TRemovePointFromSelection = (pointIndex: number) => void

export type TMovePointToNewCoordsTemp = (
  pointIndex: number,
  originalCoords: TPointCoords,
  change: TPointCoords,
  minimumHumanNoticableDiffInTime: number,
  minimumHumanNoticableDiffInValue: number,
) => TPointCoords

export type TMovePointToNewCoords = (
  pointIndex: number,
  newCoords: TPointCoords,
) => void

export type TMoveSingleHandle = (
  pointIndex: number,
  newHandle: TPointSingleHandle,
) => void

export type TFnNeedsPointIndex = (pointIndex: number) => void

export type TMoveDopesheetConnector = (pointIndex: number) => void

export type TMoveDopesheetConnectorTemp = (
  pointIndex: number,
  moveAmount: number,
) => void

export type TPointMove = [number, number]

export type TGetAllPoints = () => TNormalizedPoints

export type TTempPointRenderer = (
  point: TNormalizedPoint,
  nextPoint: TNormalizedPoint,
) => React.ReactNode

export type TTempPointsInSelection = {
  [pointIndex: string]: TNormalizedPoint
}
