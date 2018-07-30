import {VariableID} from '$theater/AnimationTimelinePanel/types'

export type TOverlaysAPI = {
  showPointValuesEditor: (props: TPointValuesEditorProps) => void
  showPointContextMenu: () => void
  showConnectorContextMenu: () => void
}

export type TPointValuesEditorProps = {
  left: number
  top: number
  initialValue: number
  initialTime: number
  variableId: VariableID
  pointIndex: number
}
