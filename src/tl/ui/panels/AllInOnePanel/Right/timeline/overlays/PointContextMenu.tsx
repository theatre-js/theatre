import React from 'react'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdStars from 'react-icons/lib/md/stars'
import UIComponent from '$tl/ui/handy/UIComponent'
import {TPointContextMenuProps} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'

interface IProps extends TPointContextMenuProps {
  onClose: () => void
}

interface IState {}

class PointContextMenu extends UIComponent<IProps, IState> {
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
            cb: onClose,
            IconComponent: MdDonutSmall,
            disabled: true,
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
    this.project.reduxStore.dispatch(
      this.project._actions.historic.removePointInBezierCurvesOfScalarValues({
        propAddress: this.props.propAddress,
        pointIndex: this.props.pointIndex,
      }),
    )
    this.props.onClose()
  }

  _connectPoint = () => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.addConnectorInBezierCurvesOfScalarValues({
        propAddress: this.props.propAddress,
        pointIndex: this.props.pointIndex,
      }),
    )
    this.props.onClose()
  }
}

export default PointContextMenu
