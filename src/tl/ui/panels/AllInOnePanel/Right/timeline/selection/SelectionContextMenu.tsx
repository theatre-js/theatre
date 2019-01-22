import React from 'react'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import MdRadioButtonUnchecked from 'react-icons/lib/md/radio-button-unchecked'
import MdRemoveCircle from 'react-icons/lib/md/remove-circle'
import MdGroupWork from 'react-icons/lib/md/group-work'
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
        renderInPortal={true}
        items={[
          // {
          //   label: 'C$u$t Points',
          //   cb: noop,
          //   IconComponent: MdRadioButtonUnchecked,
          //   disabled: true,
          // },
          {
            label: '$D$elete Keyframes',
            cb: onDelete,
            IconComponent: MdRemoveCircle,
          },
          // {
          //   label: '$C$opy Points',
          //   cb: noop,
          //   IconComponent: MdGroupWork,
          //   disabled: true,
          // },
        ]}
      />
    )
  }
}
