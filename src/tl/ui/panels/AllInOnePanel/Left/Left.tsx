import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Left.css'

interface IProps {
  css?: Partial<typeof css>
}

interface IState {}

export default class Left extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <PropsAsPointer props={this.props}>
        {() => {
          return <div {...classes('container')}>here</div>
        }}
      </PropsAsPointer>
    )
  }
}
