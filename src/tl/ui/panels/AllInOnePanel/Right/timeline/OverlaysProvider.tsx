import React from 'react'
import {
  IOverlaysAPI,
  IPointValuesEditorProps,
  IPointContextMenuProps,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import PointValuesEditor from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/PointValuesEditor'
import PointContextMenu from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/PointContextMenu'
import ConnectorContextMenu from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/ConnectorContextMenu'
import noop from '$shared/utils/noop'

interface IProps {
  children: React.ReactNode
}

interface IState {
  pointValuesEditorProps: null | IPointValuesEditorProps
  pointContextMenuProps: null | IPointContextMenuProps
  connectorContextMenuProps: null | IPointContextMenuProps
}

export const OverlaysAPIContext = React.createContext<IOverlaysAPI>({
  showPointValuesEditor: noop,
  showPointContextMenu: noop,
  showConnectorContextMenu: noop,
})

class OverlaysProvider extends React.PureComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      pointValuesEditorProps: null,
      pointContextMenuProps: null,
      connectorContextMenuProps: null,
    }
  }

  render() {
    const {
      pointValuesEditorProps,
      pointContextMenuProps,
      connectorContextMenuProps,
    } = this.state
    return (
      <OverlaysAPIContext.Provider value={this.api}>
        <>
          {this.props.children}
          {pointValuesEditorProps != null && (
            <PointValuesEditor
              {...pointValuesEditorProps}
              onClose={this._clearState}
            />
          )}
          {pointContextMenuProps != null && (
            <PointContextMenu
              {...pointContextMenuProps}
              onClose={this._clearState}
            />
          )}
          {connectorContextMenuProps != null && (
            <ConnectorContextMenu
              {...connectorContextMenuProps}
              onClose={this._clearState}
            />
          )}
        </>
      </OverlaysAPIContext.Provider>
    )
  }

  _clearState = () => {
    this.setState(() => ({
      pointValuesEditorProps: null,
      pointContextMenuProps: null,
      connectorContextMenuProps: null,
    }))
  }

  _showPointValuesEditor: IOverlaysAPI['showPointValuesEditor'] = props => {
    this.setState(() => ({
      pointValuesEditorProps: props,
    }))
  }

  _showPointContextMenu: IOverlaysAPI['showPointContextMenu'] = props => {
    this.setState(() => ({
      pointContextMenuProps: props,
    }))
  }

  _showConnectorContextMenu: IOverlaysAPI['showConnectorContextMenu'] = props => {
    this.setState(() => ({
      connectorContextMenuProps: props,
    }))
  }

  api: IOverlaysAPI = {
    showPointValuesEditor: this._showPointValuesEditor,
    showPointContextMenu: this._showPointContextMenu,
    showConnectorContextMenu: this._showConnectorContextMenu,
  }
}

export default OverlaysProvider
