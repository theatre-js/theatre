import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Bottom.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import ProjectSelect from './ProjectSelect'
import Item from './Item'
import TimelineSelect from './TimelineSelect'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class Bottom extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    return (
      <div {...classes('container')}>
        <div className={css.leftContainer}>
          <ProjectSelect />
          <TimelineSelect />
        </div>
        <div className={css.rightContainer}>
          <Item>TheaterJS</Item>
        </div>
      </div>
    )
  }
}
