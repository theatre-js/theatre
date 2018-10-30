import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Bottom.css'
import ProjectSelect from './ProjectSelect'
import Item from './Item'
import TimelineSelect from './TimelineSelect'
import TimelineInstanceSelect from './TimelineInstanceSelect'
import Settings from '$tl/ui/panels/AllInOnePanel/Bottom/Settings/Settings'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import MinimizeButton from '$tl/ui/panels/AllInOnePanel/Bottom/MinimizeButton'
import logoInSvg from 'svg-inline-loader!./logoInTheBottom.svg'
import SvgIcon from '$shared/components/SvgIcon'

export const bottomHeight = parseFloat(css.bottomHeight.replace(/[a-z]+$/, ''))

const classes = resolveCss(css)

interface IProps {
  handlePanelMove: (dx: number, dy: number) => void
  handlePanelMoveEnd: (moveHappened: boolean) => void
}

interface IState {}

export default class Bottom extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <div {...classes('container')}>
        <div className={css.leftContainer}>
          <MinimizeButton />
          <ProjectSelect />
          <TimelineSelect />
          <TimelineInstanceSelect />
        </div>
        <DraggableArea
          shouldReturnMovement
          onDrag={this.props.handlePanelMove}
          onDragEnd={this.props.handlePanelMoveEnd}
        >
          <div {...classes('moveHandle')} />
        </DraggableArea>
        <div className={css.rightContainer}>
          <Settings />
          <a
            href="https://theatrejs.com"
            target="_blank"
            {...classes('logo')}
            title="Theatre.js – The hackable animation editor"
          >
            <SvgIcon sizing="fill" src={logoInSvg} {...classes('logoSvg')} />
          </a>
        </div>
      </div>
    )
  }
}
