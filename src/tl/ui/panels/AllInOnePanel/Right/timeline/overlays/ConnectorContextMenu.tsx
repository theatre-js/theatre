import React from 'react'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdCamera from 'react-icons/lib/md/camera'
import {noop} from 'redux-saga/utils'
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
    // const {pathToTimeline, variableId, pointIndex, onClose} = this.props
    // this.dispatch(
    //   reduceHistoricState(
    //     [
    //       ...pathToTimeline,
    //       'variables',
    //       variableId,
    //       'points',
    //       pointIndex,
    //       'interpolationDescriptor',
    //       'connected',
    //     ],
    //     () => false,
    //   ),
    // )
    // onClose()
  }
}

export default ConnectorContextMenu
