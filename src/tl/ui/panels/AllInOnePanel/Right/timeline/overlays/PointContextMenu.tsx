import React from 'react'
import MdLens from 'react-icons/lib/md/lens'
import MdRemoveCircle from 'react-icons/lib/md/remove-circle'
import MdOfflinePin from 'react-icons/lib/md/offline-pin'
import UIComponent from '$tl/ui/handy/UIComponent'
import {TPointContextMenuProps} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import noop from '$shared/utils/noop'

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
            cb: noop,
            IconComponent: MdLens,
            disabled: true,
          },
          {
            label: '$D$elete',
            cb: this._removePoint,
            IconComponent: MdRemoveCircle,
          },
          {
            label: '$C$onnect',
            cb: this._connectPoint,
            IconComponent: MdOfflinePin,
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
