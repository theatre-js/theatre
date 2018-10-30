import React from 'react'
import {
  TOverlaysAPI,
  TPointValuesEditorProps,
  TPointContextMenuProps,
} from '$studio/AnimationTimelinePanel/overlays/types'
import {Broadcast} from 'react-broadcast'
import PointValuesEditor from '$studio/AnimationTimelinePanel/overlays/PointValuesEditor'
import PointContextMenu from '$studio/AnimationTimelinePanel/overlays/PointContextMenu'
import ConnectorContextMenu from '$studio/AnimationTimelinePanel/overlays/ConnectorContextMenu'

interface IProps {
  pathToTimeline: string[]
  children: React.ReactNode
}

interface IState {
  pointValuesEditorProps: null | TPointValuesEditorProps
  pointContextMenuProps: null | TPointContextMenuProps
  connectorContextMenuProps: null | TPointContextMenuProps
}

export const OverlaysAPIChannel = 'studiojs/OverlaysAPIChannel'

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
    const {pathToTimeline} = this.props
    return (
      <Broadcast channel={OverlaysAPIChannel} value={this.api}>
        <>
          {this.props.children}
          {pointValuesEditorProps != null && (
            <PointValuesEditor
              {...pointValuesEditorProps}
              pathToTimeline={pathToTimeline}
              onClose={this._clearState}
            />
          )}
          {pointContextMenuProps != null && (
            <PointContextMenu
              {...pointContextMenuProps}
              pathToTimeline={pathToTimeline}
              onClose={this._clearState}
            />
          )}
          {connectorContextMenuProps != null && (
            <ConnectorContextMenu
              {...connectorContextMenuProps}
              pathToTimeline={pathToTimeline}
              onClose={this._clearState}
            />
          )}
        </>
      </Broadcast>
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
