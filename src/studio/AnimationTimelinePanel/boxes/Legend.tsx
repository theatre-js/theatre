import React from 'react'
import css from './Legend.css'
import {legendTextHover} from './BoxLegends.css'
import {VariableID, VariableObject} from '$studio/AnimationTimelinePanel/types'
import {val} from '$shared/DataVerse2/atom'
import {get} from '$shared/utils'
import {Pointer} from '$shared/DataVerse2/pointer'
import resolveCss from '$shared/utils/resolveCss'
import HalfPieContextMenu from '$studio/common/components/HalfPieContextMenu'
import MdSwapVerticalCircel from 'react-icons/lib/md/swap-vertical-circle'
import FaBullseye from 'react-icons/lib/fa/bullseye'
import FaCircleO from 'react-icons/lib/fa/circle-o'
import noop from '$shared/utils/noop'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'

const classes = resolveCss({...css, legendTextHover})

interface IProps {
  variableId: VariableID
  pathToTimeline: string[]
  color: string
  isActive: boolean
  isSplittable: boolean
  splitVariable: (variableId: VariableID) => any
  setActiveVariable: (variableId: VariableID) => any
}

interface IState {
  contextMenuProps: null | {
    left: number
    top: number
  }
}

class Legend extends PureComponentWithTheater<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      contextMenuProps: null,
    }
  }

  render() {
    const {contextMenuProps} = this.state
    const variable: VariableObject = val(get(
      this.studio.atom2.pointer,
      this.props.pathToTimeline.concat('variables', this.props.variableId),
    ) as Pointer<VariableObject>)
    const {property, component} = variable

    return (
      <>
        <div
          {...classes('container')}
          style={{'--color': this.props.color}}
          onClick={this.setAsActive}
          onContextMenu={this.openContextMenu}
        >
          <div {...classes('legendBar', this.props.isActive && 'isActive')} />
          <div {...classes('legendText', 'legendTextHover')}>
            <span {...classes('component')}>{component}</span>
            <span {...classes('separator')}>&nbsp;/&nbsp;</span>
            <span {...classes('property')}>{property}</span>
          </div>
        </div>
        {contextMenuProps != null && (
          <HalfPieContextMenu
            close={this.closeContextMenu}
            centerPoint={contextMenuProps}
            placement="top"
            items={[
              {
                label: '$S$plit Variable',
                cb: this.split,
                disabled: !this.props.isSplittable,
                IconComponent: MdSwapVerticalCircel,
              },
              {
                label: 'Hide $O$ther Variables',
                cb: noop,
                IconComponent: FaBullseye,
              },
              {
                label: '$H$ide Variable',
                cb: noop,
                IconComponent: FaCircleO,
              },
            ]}
          />
        )}
      </>
    )
  }

  split = () => {
    this.props.splitVariable(this.props.variableId)
  }

  setAsActive = () => {
    this.props.setActiveVariable(this.props.variableId)
  }

  openContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const {clientX, clientY} = e
    this.setState(() => ({
      contextMenuProps: {
        left: clientX,
        top: clientY,
      },
    }))
  }

  closeContextMenu = () => {
    this.setState(() => ({contextMenuProps: null}))
  }
}

export default Legend
