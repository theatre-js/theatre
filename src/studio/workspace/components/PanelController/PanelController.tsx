import {React, connect, reduceStateAction} from '$src/studio/handy'
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

type OwnProps = {
  panelId: string
  activeMode: ActiveMode
  boundaries: $FixMe
  gridOfBoundaries: $FixMe
  updatePanelBoundaries: Function
}

type Props = OwnProps & {
  dispatch: Function
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

class PanelController extends React.Component<Props, State> {
  static defaultProps = {
    persistentState: {
      isInSettings: true,
    },
    outputs: {},
  }

  constructor(props: Props) {
    super(props)
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
      <Broadcast channel={PanelControlChannel} value={panelControlChannelData}>
        <PanelComponent
          {...configuration}
          {...componentState}
          // panelDimensions={dim}
          outputs={outputs}
          inputs={inputs}
          updatePanelOutput={this.updatePanelOutput}
        />
      </Broadcast>
    )
  }

  updatePanelData(propertyToUpdate: string, newData: Object) {
    this.props.dispatch(
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

export default connect((s, op: OwnProps) => {
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
