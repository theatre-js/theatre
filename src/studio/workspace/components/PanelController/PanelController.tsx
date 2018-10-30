import {reduceStateAction} from '$shared/utils/redux/commonActions'
import React from 'react'

import {IXY, IPanelType} from '$studio/workspace/types'

import {getPanelById, getActivePanelId} from '$studio/workspace/selectors'
import * as panelComponents from '$studio/workspace/panelComponents'
import {Broadcast} from 'react-broadcast'
import {ITheatreStoreState} from '$studio/types'
import {isEqual} from '$shared/utils'
import PureComponentWithTheatre from '$studio/handy/PureComponentWithTheatre'
import connect from '$studio/handy/connect'
import {ActiveMode} from '$studio/common/components/ActiveModeDetector/ActiveModeDetector'

export const PanelControlChannel = 'TheatreJS/PanelControlChannel'

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
  type: IPanelType
  isActive: boolean
}

interface IBoundary {
  xlow: number
  xhigh: number
  ylow: number
  yhigh: number
}

interface IPanelPlacementState {
  move: IXY
  resize: IXY
  moveBoundaries: IBoundary
  resizeBoundaries: IBoundary
}

type State = IPanelPlacementState & {
  isMoving: boolean
}

class PanelController extends PureComponentWithTheatre<IProps, State> {
  static defaultProps = {}

  render() {
    const {props} = this
    const {type} = props

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
        <PanelComponent />
      </Broadcast>
    )
  }

  updatePanelData(propertyToUpdate: string, newData: Object) {
    this.dispatch(
      reduceStateAction(
        [
          'historicWorkspace',
          'panels',
          'byId',
          this.props.panelId,
          propertyToUpdate,
        ],
        data => ({...data, ...newData}),
      ),
    )
  }

  updatePanelOutput = (newData: mixed) => {
    return this.updatePanelData('outputs', newData)
  }
}

export default connect((s: ITheatreStoreState, op: OwnProps) => {
  const {type, configuration, persistentState, outputs, inputs} = getPanelById(
    s,
    op.panelId,
  )

  return {
    type,
    isActive: getActivePanelId(s) === op.panelId,
  }
})(PanelController)
