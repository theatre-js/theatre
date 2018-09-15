import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './index.css'

interface IProps {
  css?: Partial<typeof css>
  children: React.ReactNode
  onClick?: () => void
}

interface IState {}

export default class HumongousButton extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <button onClick={this.props.onClick} {...classes('container')}>
        {this.props.children}
      </button>
    )
  }
}
