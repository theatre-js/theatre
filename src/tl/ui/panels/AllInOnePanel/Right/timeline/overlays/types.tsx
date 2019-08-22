import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'

export type IOverlaysAPI = {
  showPointValuesEditor: (props: IPointValuesEditorProps) => void
  showPointContextMenu: (props: IPointContextMenuProps) => void
  showConnectorContextMenu: (prop: IConnectorContextMenuProps) => void
}

export type IPointValuesEditorProps = {
  left: number
  top: number
  initialValue: number
  initialTime: number
  pointIndex: number
  propAddress: PrimitivePropItem['address']
}

export type IPointContextMenuProps = {
  left: number
  top: number
  pointIndex: number
  propAddress: PrimitivePropItem['address']
}

export type IConnectorContextMenuProps = {
  left: number
  top: number
  pointIndex: number
  propAddress: PrimitivePropItem['address']
}
