import React from 'react'
import {
  TOverlaysAPI,
  TPointValuesEditorProps,
  TPointContextMenuProps,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import PointValuesEditor from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/PointValuesEditor'
import PointContextMenu from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/PointContextMenu'
import ConnectorContextMenu from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/ConnectorContextMenu'
import noop from '$shared/utils/noop'

interface IProps {
  children: React.ReactNode
}

interface IState {
  pointValuesEditorProps: null | TPointValuesEditorProps
  pointContextMenuProps: null | TPointContextMenuProps
  connectorContextMenuProps: null | TPointContextMenuProps
}

export const OverlaysAPIContext = React.createContext<TOverlaysAPI>({
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

  _showPointValuesEditor: TOverlaysAPI['showPointValuesEditor'] = props => {
    this.setState(() => ({
      pointValuesEditorProps: props,
    }))
  }

  _showPointContextMenu: TOverlaysAPI['showPointContextMenu'] = props => {
    this.setState(() => ({
      pointContextMenuProps: props,
    }))
  }

  _showConnectorContextMenu: TOverlaysAPI['showConnectorContextMenu'] = props => {
    this.setState(() => ({
      connectorContextMenuProps: props,
    }))
  }

  api: TOverlaysAPI = {
    showPointValuesEditor: this._showPointValuesEditor,
    showPointContextMenu: this._showPointContextMenu,
    showConnectorContextMenu: this._showConnectorContextMenu,
  }
}

export default OverlaysProvider
