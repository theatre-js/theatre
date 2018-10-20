import React from 'react'
import MdLens from 'react-icons/lib/md/lens'
import MdRemoveCircle from 'react-icons/lib/md/remove-circle'
import MdCheckCircle from 'react-icons/lib/md/check-circle'
import {TConnectorContextMenuProps} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import UIComponent from '$tl/ui/handy/UIComponent'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import noop from '$shared/utils/noop'

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
            cb: noop,
            IconComponent: MdLens,
            disabled: true,
          },
          {
            label: '$D$elete',
            cb: this._removeConnector,
            IconComponent: MdRemoveCircle,
          },
          {
            label: '$S$elect',
            cb: noop,
            IconComponent: MdCheckCircle,
            disabled: true,
          },
        ]}
      />
    )
  }

  _removeConnector = () => {
    this.project.reduxStore.dispatch(
      this.project._actions.historic.removeConnectorInBezierCurvesOfScalarValues(
        {
          propAddress: this.props.propAddress,
          pointIndex: this.props.pointIndex,
        },
      ),
    )
    this.props.onClose()
  }
}

export default ConnectorContextMenu
