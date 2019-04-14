import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Item.css'
import {ReactComponent} from '$shared/types'

interface IProps {
  css?: Partial<typeof css>
  onClick?: () => void
  component?: string | ReactComponent
  otherProps?: {}
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
    const Component = props.component || 'div'
    const otherProps = props.otherProps || {}
    return (
      <Component
        {...classes('container')}
        onClick={props.onClick}
        {...otherProps}
      >
        {props.children}
      </Component>
    )
  }
}
