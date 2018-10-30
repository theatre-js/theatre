import React from 'react'
import HalfPieContextMenu from '$theater/common/components/HalfPieContextMenu'
import {TPointContextMenuProps} from '$theater/AnimationTimelinePanel/overlays/types'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdStars from 'react-icons/lib/md/stars'
import noop from '$shared/utils/noop'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import {TPoint} from '$theater/AnimationTimelinePanel/types'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

interface IProps extends TPointContextMenuProps {
  pathToTimeline: string[]
  onClose: () => void
}

interface IState {}

class PointContextMenu extends PureComponentWithTheater<IProps, IState> {
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
            cb: this._removePoint,
            IconComponent: MdCancel,
          },
          {
            label: '$C$onnect',
            cb: this._connectPoint,
            IconComponent: MdStars,
          },
        ]}
      />
    )
  }

  _removePoint = () => {
    const {pathToTimeline, variableId, pointIndex, onClose} = this.props
    this.dispatch(
      reduceHistoricState(
        [...pathToTimeline, 'variables', variableId, 'points'],
        (points: TPoint[]): TPoint[] => {
          if (points[pointIndex - 1] != null) {
            points[pointIndex - 1].interpolationDescriptor.connected = false
          }
          return points
            .slice(0, pointIndex)
            .concat(points.slice(pointIndex + 1))
        },
      ),
    )
    onClose()
  }

  _connectPoint = () => {
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
        () => true,
      ),
    )
    onClose()
  }
}

export default PointContextMenu
