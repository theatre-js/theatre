import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './index.css'

interface IProps {
  css?: Partial<typeof css>
  code: string
}

interface IState {}

export default class SyntaxHighlightedCode extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <div
        {...classes('container')}
        dangerouslySetInnerHTML={{__html: this.props.code}}
      />
    )
  }
}
