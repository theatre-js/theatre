import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Left.css'
import {val} from '$shared/DataVerse2/atom'

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
    const selectedProject = val(
      this.ui.atomP.historic.allInOnePanel.selectedProject,
    )

    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          return <div {...classes('container')}>here</div>
        }}
      </PropsAsPointer>
    )
  }
}
