import React from 'react'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdCancel from 'react-icons/lib/md/cancel'
import MdStars from 'react-icons/lib/md/stars'
import noop from '$shared/utils/noop'

interface IProps {
  left: number
  top: number
  onClose: () => void
  onDelete: () => void
}

interface IState {}

export default class SelectionContextMenu extends React.PureComponent<
  IProps,
  IState
> {
  render() {
    const {left, top, onClose, onDelete} = this.props
    return (
      <HalfPieContextMenu
        close={onClose}
        centerPoint={{left, top}}
        placement="top"
        renderInPortal={false}
        items={[
          {
            label: 'C$u$t Points',
            cb: noop,
            IconComponent: MdDonutSmall,
            disabled: true,
          },
          {
            label: '$D$elete Points',
            cb: onDelete,
            IconComponent: MdCancel,
          },
          {
            label: '$C$opy Points',
            cb: noop,
            IconComponent: MdStars,
            disabled: true,
          },
        ]}
      />
    )
  }
}
