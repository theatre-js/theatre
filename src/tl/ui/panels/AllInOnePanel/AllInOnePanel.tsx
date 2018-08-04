import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './AllInOnePanel.css'
import {val} from '$shared/DataVerse2/atom'
import Left from '$tl/ui/panels/AllInOnePanel/Left/Left'
import Bottom from './Bottom/Bottom'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

export default class AllInOnePanel extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          const height = val(this.ui.atomP.historic.allInOnePanel.height)

          // if (!selectedProject)
          // const project = projectsSingleton.atom.pointer.projects[selectedProject]
          return (
            <div {...classes('container')} style={{height: height + 'px'}}>
              <div {...classes('middle')}>
                <Left />
              </div>
              <div {...classes('bottom')}>
                <Bottom />
              </div>
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
}
