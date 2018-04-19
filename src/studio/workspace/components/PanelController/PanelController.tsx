import {reduceStateAction} from '$shared/utils/redux/commonActions'
import React from 'react'

import {
  XY,
  PanelType,
  PanelConfiguration,
  PanelPersistentState,
  PanelOutput,
} from '$src/studio/workspace/types'

import {
  getPanelById,
  getPanelInputs,
  getActivePanelId,
} from '$src/studio/workspace/selectors'

import * as panelComponents from '$src/studio/workspace/panelComponents'
import {Broadcast} from 'react-broadcast'
import {ActiveMode} from '$src/studio/workspace/components/StudioUI/StudioUI'
import {IStudioStoreState} from '$studio/types'
import {isEqual} from 'lodash'
import StudioComponent from '$studio/handy/StudioComponent'
import connect from '$studio/handy/connect'

export const PanelControlChannel = 'TheaterJS/PanelControlChannel'

export interface IPanelControlChannelData {
  panelId: string
  isActive: boolean
  label: string
  activeMode: ActiveMode
  boundaries: $FixMe
  gridOfBoundaries: $FixMe
  updatePanelBoundaries: Function
}

interface OwnProps {
  panelId: string
  activeMode: ActiveMode
  boundaries: $FixMe
  gridOfBoundaries: $FixMe
  updatePanelBoundaries: Function
}

interface IProps extends OwnProps {
  type: PanelType
  configuration: PanelConfiguration
  persistentState: PanelPersistentState
  outputs: PanelOutput
  inputs: {[k: string]: Object}
  isActive: boolean
}

interface IBoundary {
  xlow: number
  xhigh: number
  ylow: number
  yhigh: number
}

interface IPanelPlacementState {
  move: XY
  resize: XY
  moveBoundaries: IBoundary
  resizeBoundaries: IBoundary
}

type State = IPanelPlacementState & {
  isMoving: boolean
}

class PanelController extends StudioComponent<IProps, State> {
  static defaultProps = {
    persistentState: {
      isInSettings: true,
    },
    outputs: {},
  }

  render() {
    const {props} = this
    const {
      persistentState: {isInSettings, ...componentState},
      configuration,
      outputs,
      inputs,
      type,
    } = props

    const PanelComponent = panelComponents[type]

    const panelControlChannelData: IPanelControlChannelData = {
      panelId: props.panelId,
      isActive: props.isActive,
      label: PanelComponent.panelName,
      activeMode: props.activeMode,
      boundaries: props.boundaries,
      gridOfBoundaries: props.gridOfBoundaries,
      updatePanelBoundaries: props.updatePanelBoundaries,
    }

    return (
      <Broadcast
        channel={PanelControlChannel}
        value={panelControlChannelData}
        compareValues={(prevValue: $FixMe, nextValue: $FixMe) =>
          isEqual(prevValue, nextValue)
        }
      >
        <PanelComponent
          {...configuration}
          // {...componentState}
          // panelDimensions={dim}
          outputs={outputs}
          inputs={inputs}
          updatePanelOutput={this.updatePanelOutput}
        />
      </Broadcast>
    )
  }

  updatePanelData(propertyToUpdate: string, newData: Object) {
    this.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'byId', this.props.panelId, propertyToUpdate],
        data => ({...data, ...newData}),
      ),
    )
  }

  updatePanelOutput = (newData: mixed) => {
    return this.updatePanelData('outputs', newData)
  }
}

export default connect((s: IStudioStoreState, op: OwnProps) => {
  const {
    type,
    configuration,
    placementSettings,
    persistentState,
    outputs,
    inputs,
  } = getPanelById(s, op.panelId)

  return {
    type,
    configuration,
    persistentState,
    ...placementSettings,
    outputs,
    inputs: getPanelInputs(s, inputs),
    isActive: getActivePanelId(s) === op.panelId,
  }
})(PanelController)
