import {
  IPointValuesEditorProps,
  IPointContextMenuProps,
  IConnectorContextMenuProps,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import {
  IPointCoords,
  IPointSingleHandle,
  INormalizedPoints,
  INormalizedPoint,
  IExtremums,
} from '$tl/ui/panels/AllInOnePanel/Right/types'

export type IShowPointValuesEditor = (
  props: Pick<
    IPointValuesEditorProps,
    'initialValue' | 'initialTime' | 'top' | 'left' | 'pointIndex'
  >,
) => void

export type IShowPointContextMenu = (
  props: Pick<IPointContextMenuProps, 'left' | 'top' | 'pointIndex'>,
) => void

export type IShowConnectorContextMenu = (
  props: Pick<IConnectorContextMenuProps, 'left' | 'top' | 'pointIndex'>,
) => void

export type IAddPointToSelection = (
  pointIndex: number,
  pointData: IPointCoords,
  extremums?: IExtremums,
) => void

export type IRemovePointFromSelection = (pointIndex: number) => void

export type IMovePointToNewCoordsTemp = (
  pointIndex: number,
  originalCoords: IPointCoords,
  change: IPointCoords,
  minimumHumanNoticableDiffInTime: number,
  minimumHumanNoticableDiffInValue: number,
) => IPointCoords

export type IMovePointToNewCoords = (
  pointIndex: number,
  newCoords: IPointCoords,
) => void

export type IMoveSingleHandle = (
  pointIndex: number,
  newHandle: IPointSingleHandle,
) => void

export type IFnNeedsPointIndex = (pointIndex: number) => void

export type IMoveDopesheetConnector = (pointIndex: number) => void

export type IMoveDopesheetConnectorTemp = (
  pointIndex: number,
  moveAmount: number,
) => void

export type IGetAllPoints = () => INormalizedPoints

export type ITempPointRenderer = (
  point: INormalizedPoint,
  nextPoint: INormalizedPoint,
) => React.ReactNode

export type ITempPointsInSelection = {
  [pointIndex: string]: INormalizedPoint
}
