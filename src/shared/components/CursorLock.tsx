import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './CursorLock.css'
import ReactDOM from 'react-dom'

interface IProps {
  enabled: boolean
  cursor: string
}
const classes = resolveCss(css)

interface IState {}

export default class CursorLock extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    if (!this.props.enabled) return null

    return ReactDOM.createPortal(this._renderBody(), document.body)
  }
  _renderBody() {
    return (
      <div {...classes('container')} style={{cursor: this.props.cursor}}>
        here
      </div>
    )
  }
}
