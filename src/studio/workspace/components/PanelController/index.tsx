import {React, connect, reduceStateAction} from '$src/studio/handy'
import {
  XY,
  PanelType,
  PanelConfiguration,
  PanelPersistentState,
  PanelOutput,
  DraggingOutput,
} from '$src/studio/workspace/types'

import {
  getPanelById,
  getCurrentlyDraggingOutput,
  getPanelInputs,
  getActivePanelId,
} from '$src/studio/workspace/selectors'

import panelTypes from '$src/studio/workspace/panelTypes'
import {Broadcast} from 'react-broadcast'
import {ActiveMode} from '$studio/workspace/components/TheUI'

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
  currentlyDraggingOutput: DraggingOutput
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
  panelComponents: {
    Content: React.ComponentType<$FixMe>
    Settings: React.ComponentType<$FixMe>
  }

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
      // currentlyDraggingOutput,
      outputs,
      inputs,
      type,
    } = props
    const panelType = panelTypes[type]
    const panelComponents = panelType.components

    const panelControlChannelData: IPanelControlChannelData = {
      panelId: props.panelId,
      isActive: props.isActive,
      label: panelType.label,
      activeMode: props.activeMode,
      boundaries: props.boundaries,
      gridOfBoundaries: props.gridOfBoundaries,
      updatePanelBoundaries: props.updatePanelBoundaries,
    }

    return (
      <Broadcast channel={PanelControlChannel} value={panelControlChannelData}>
        <panelComponents.Content
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
  const currentlyDraggingOutput = getCurrentlyDraggingOutput(s)

  return {
    type,
    configuration,
    persistentState,
    ...placementSettings,
    currentlyDraggingOutput,
    outputs,
    inputs: getPanelInputs(s, inputs),
    isActive: getActivePanelId(s) === op.panelId,
  }
})(PanelController)
