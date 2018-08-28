import {VariableID} from '$theater/AnimationTimelinePanel/types'

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
  variableId: VariableID
  pointIndex: number
}

export type TPointContextMenuProps = {
  left: number
  top: number
  variableId: VariableID
  pointIndex: number
}

export type TConnectorContextMenuProps = {
  left: number
  top: number
  variableId: VariableID
  pointIndex: number
}
