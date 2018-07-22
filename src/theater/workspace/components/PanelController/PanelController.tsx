import {reduceStateAction} from '$shared/utils/redux/commonActions'
import React from 'react'

import {
  IXY,
  IPanelType,
} from '$theater/workspace/types'

import {
  getPanelById,
  getActivePanelId,
} from '$theater/workspace/selectors'

import * as panelComponents from '$theater/workspace/panelComponents'
import {Broadcast} from 'react-broadcast'
import {ActiveMode} from '$theater/workspace/components/StudioUI/StudioUI'
import {ITheaterStoreState} from '$theater/types'
import {isEqual} from 'lodash'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import connect from '$theater/handy/connect'

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

class PanelController extends PureComponentWithTheater<IProps, State> {
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
}

export default connect((s: ITheaterStoreState, op: OwnProps) => {
  const {type} = getPanelById(s, op.panelId)

  return {
    type,
    isActive: getActivePanelId(s) === op.panelId,
  }
})(PanelController)
