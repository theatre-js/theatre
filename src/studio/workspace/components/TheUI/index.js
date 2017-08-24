// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$studio/types'
import {type PanelPlacementSettings} from '$studio/workspace/types'
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

  static getDefaultPanelPlacement(): PanelPlacementSettings {
    return {
      pos: {x: 35, y: 25},
      dim: {x: 30, y: 50},
    }
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

  createNewPanel = (type: string, defaultConfig: $FlowFixMe) => {
    const panelProperties = {
      type,
      configuration: defaultConfig,
      placementSettings: TheUI.getDefaultPanelPlacement(),
    }
    this.setState(() => ({isCreatingNewPanel: false}))
    this.props.runSaga(createPanel, panelProperties)
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
