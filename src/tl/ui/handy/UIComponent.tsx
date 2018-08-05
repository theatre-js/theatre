import React from 'react'
import propTypes from 'prop-types'
import UI from '$tl/ui/UI'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'

export default class UIComponent<Props, State> extends React.PureComponent<
  Props,
  State
> {
  ui: UI


  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.ui = context.ui
  }

  render(): React.ReactNode {
    return (
      // @ts-ignore ignore
      <PropsAsPointer props={this.props} state={this.state}>
        {this.__render}
      </PropsAsPointer>
    )
  }

  __render = ({
    props,
    state,
  }: {
    props: Pointer<Props>
    state: Pointer<State>
  }): React.ReactNode => {
    return this._render(props, state)
  }

  // @ts-ignore ignore
  _render(props: Pointer<Props>, state: Pointer<State>): React.ReactNode {
    return null
  }

  static contextTypes = {
    ui: propTypes.any,
  }
}
