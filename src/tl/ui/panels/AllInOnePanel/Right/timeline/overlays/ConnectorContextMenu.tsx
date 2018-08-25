import React from 'react'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdCamera from 'react-icons/lib/md/camera'
import {TConnectorContextMenuProps} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import UIComponent from '$tl/ui/handy/UIComponent'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'

interface IProps extends TConnectorContextMenuProps {
  onClose: () => void
}

interface IState {}

class ConnectorContextMenu extends UIComponent<IProps, IState> {
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
          },
          {
            label: '$D$elete',
            cb: this._removeConnector,
            IconComponent: MdCancel,
          },
          {
            label: '$S$elect',
            cb: onClose,
            IconComponent: MdCamera,
          },
        ]}
      />
    )
  }

  _removeConnector = () => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.removeConnectorInBezierCurvesOfScalarValues({
        propAddress: this.props.propAddress,
        pointIndex: this.props.pointIndex,
      })
    )
    this.props.onClose()
  }
}

export default ConnectorContextMenu
