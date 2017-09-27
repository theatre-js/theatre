// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$studio/types'
import {type PanelPlacementSettings, type PanelPersistentState} from '$studio/workspace/types'
import {getVisiblePanelsList} from '$studio/workspace/selectors'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {createPanel} from '$studio/workspace/sagas'
import Panel from '../Panel'
import PanelCreator from '../PanelCreator'
import css from './index.css'

type Props = WithRunSagaProps & {
  visiblePanels: Array<string>,
}

type State = {
  isCreatingNewPanel: boolean,
}

class TheUI extends React.Component {
  props: Props
  state: State

  static getDefaultPanelPlacement(type): PanelPlacementSettings {
    // ??
    switch (type) {
      case 'animationTimeline':
        return {
          pos: {x: 20, y: 25},
          dim: {x: 60, y: 50},
        }
      default:
        return {
          pos: {x: 35, y: 25},
          dim: {x: 30, y: 50},
        }
    }
  }

  static getDefaultPanelPersistentState(): PanelPersistentState {
    return {
      isInSettings: true,
    }
  }

  static getDefaultPanelConfig(): Object {
    return {}
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isCreatingNewPanel: false,
    }
  }

  showPanelCreator = () => {
    this.setState(() => ({isCreatingNewPanel: true}))
  }

  createNewPanel = (type: string) => {
    const panelProperties = {
      type,
      persistentState: TheUI.getDefaultPanelPersistentState(),
      configuration: TheUI.getDefaultPanelConfig(),
      placementSettings: TheUI.getDefaultPanelPlacement(type),
      inputs: {},
      outputs: {},
    }
    this.setState(() => ({isCreatingNewPanel: false}))
    this.props.runSaga(createPanel, panelProperties)
  }

  cancelCreatingNewPanel = () => {
    this.setState(() => ({isCreatingNewPanel: false}))
  }

  render() {
    const {visiblePanels} = this.props
    const {isCreatingNewPanel} = this.state
    return (
      <div>
        {
          visiblePanels.map((panelId) => (
            <Panel key={panelId} panelId={panelId} />
          ))
        }
        {isCreatingNewPanel &&
          <PanelCreator
            onCreatingPanel={this.createNewPanel}
            onCancel={this.cancelCreatingNewPanel}
            {...TheUI.getDefaultPanelPlacement()}/>
        }
        <button
          className={css.button}
          onClick={this.showPanelCreator}>
          Create a new Panel!
        </button>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: StoreState) => {
      return {
        visiblePanels: getVisiblePanelsList(state),
      }
    }
  ),
  withRunSaga(),
)(TheUI)
