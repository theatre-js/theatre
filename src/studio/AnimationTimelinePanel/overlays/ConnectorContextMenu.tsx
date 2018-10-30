import React from 'react'
import {TConnectorContextMenuProps} from '$studio/AnimationTimelinePanel/overlays/types'
import PureComponentWithTheatre from '$studio/handy/PureComponentWithTheatre'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdCamera from 'react-icons/lib/md/camera'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import {noop} from 'redux-saga/utils'
import {reduceHistoricState} from '$studio/bootstrap/actions'

interface IProps extends TConnectorContextMenuProps {
  pathToTimeline: string[]
  onClose: () => void
}

interface IState {}

class ConnectorContextMenu extends PureComponentWithTheatre<IProps, IState> {
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
}

export default ConnectorContextMenu
