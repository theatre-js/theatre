import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './StringRepresentation.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'

interface IProps {
  css?: Partial<typeof css>
}

interface IState {}

export default class StringRepresentation extends UIComponent<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)

    return (
      <div {...classes('container')}>
      </div>
    )
  }
}