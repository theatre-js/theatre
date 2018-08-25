import {VariableID} from '$theater/AnimationTimelinePanel/types'
import { PrimitivePropItem } from '$tl/ui/panels/AllInOnePanel/utils';

export type TOverlaysAPI = {
  showPointValuesEditor: (props: TPointValuesEditorProps) => void
  showPointContextMenu: (props: TPointContextMenuProps) => void
  showConnectorContextMenu: (prop: TConnectorContextMenuProps) => void
}

export type TPointValuesEditorProps = {
  left: number
  top: number
  initialValue: number
  initialTime: number
  pointIndex: number
  propAddress: PrimitivePropItem['address']
}

export type TPointContextMenuProps = {
  left: number
  top: number
  pointIndex: number
  propAddress: PrimitivePropItem['address']
}

export type TConnectorContextMenuProps = {
  left: number
  top: number
  pointIndex: number
  propAddress: PrimitivePropItem['address']
}