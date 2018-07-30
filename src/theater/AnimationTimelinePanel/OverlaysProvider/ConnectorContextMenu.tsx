import React from 'react'
import {TConnectorContextMenuProps} from '$theater/AnimationTimelinePanel/OverlaysProvider/types'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdCamera from 'react-icons/lib/md/camera'
import HalfPieContextMenu from '$theater/common/components/HalfPieContextMenu'
import {noop} from 'redux-saga/utils'
import {reduceHistoricState} from '$theater/bootstrap/actions'

interface IProps extends TConnectorContextMenuProps {
  pathToTimeline: string[]
  onClose: () => void
}

interface IState {}

class ConnectorContextMenu extends PureComponentWithTheater<IProps, IState> {
  _removeConnector = () => {
    const {pathToTimeline, variableId, pointIndex, onClose} = this.props
    this.dispatch(
      reduceHistoricState(
        [
          ...pathToTimeline,
          'variables',
          variableId,
          'points',
          pointIndex,
          'interpolationDescriptor',
          'connected',
        ],
        () => false,
      ),
    )
    onClose()
  }

  render() {
    const {onClose, top, left} = this.props
    return (
      <HalfPieContextMenu
        close={onClose}
        centerPoint={{left, top}}
        placement="top"
        items={[
          {
            label: '$R$eset',
            cb: noop,
            IconComponent: MdDonutSmall,
          },
          {
            label: '$D$elete',
            cb: this._removeConnector,
            IconComponent: MdCancel,
          },
          {
            label: '$S$elect',
            cb: noop,
            IconComponent: MdCamera,
          },
        ]}
      />
    )
  }
}

export default ConnectorContextMenu
