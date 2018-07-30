import {
  TPointValuesEditorProps,
  TPointContextMenuProps,
  TConnectorContextMenuProps,
} from '$theater/AnimationTimelinePanel/OverlaysProvider/types'
import {TPointData} from '$theater/AnimationTimelinePanel/SelectionProvider/types'

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
  pointData: TPointData,
) => void

export type TRemovePointFromSelection = (pointIndex: number) => void
