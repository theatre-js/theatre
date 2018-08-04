import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Item.css'

interface IProps {
  css?: Partial<typeof css>
  onClick?: () => void
}

interface IState {}

export default class Item extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)
    return (
      <div {...classes('container')} onClick={props.onClick}>
        {props.children}
      </div>
    )
  }
}
