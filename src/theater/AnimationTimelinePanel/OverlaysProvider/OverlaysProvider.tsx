import React from 'react'
import {
  TOverlaysAPI,
  TPointValuesEditorProps,
} from '$theater/AnimationTimelinePanel/OverlaysProvider/types'
import {Broadcast} from 'react-broadcast'
import PointValuesEditor from '$theater/AnimationTimelinePanel/OverlaysProvider/PointValuesEditor'

interface IProps {
  pathToTimeline: string[]
  children: React.ReactNode
}

interface IState {
  pointValuesEditorProps: null | TPointValuesEditorProps
}

export const OverlaysAPIChannel = 'theaterjs/OverlaysAPIChannel'

class OverlaysProvider extends React.PureComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      pointValuesEditorProps: null,
    }
  }

  _clearState = () => {
    this.setState(() => ({
      pointValuesEditorProps: null,
    }))
  }

  _showPointValuesEditor = (props: TPointValuesEditorProps) => {
    this.setState(() => ({
      pointValuesEditorProps: props,
    }))
  }

  api: TOverlaysAPI = {
    showPointValuesEditor: this._showPointValuesEditor,
    showPointContextMenu: () => {},
    showConnectorContextMenu: () => {},
  }

  render() {
    const {pointValuesEditorProps} = this.state
    return (
      <Broadcast channel={OverlaysAPIChannel} value={this.api}>
        <>
          {this.props.children}
          {pointValuesEditorProps != null && (
            <PointValuesEditor
              {...pointValuesEditorProps}
              pathToTimeline={this.props.pathToTimeline}
              onClose={this._clearState}
            />
          )}
        </>
      </Broadcast>
    )
  }
}

export default OverlaysProvider
