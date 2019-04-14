import React from 'react'
import propTypes from 'prop-types'
import UI from '$tl/ui/UI'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {Pointer} from '$shared/DataVerse/pointer'
import Project from '$tl/Project/Project'

export default class UIComponent<Props, State> extends React.Component<
  Props,
  State
> {
  ui: UI
  // renderHookie: undefined | React.SFC<Pointer<Props>>
  // private _hooksilosa: undefined | React.SFC<Props>

  public get project() {
    return this.ui._selectors.historic.getSelectedProject(this.ui) as Project
  }

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.ui = context.ui
    //   const renderHookie = this.renderHookie
    //   if (renderHookie) {
    //     this._hooksilosa = (props: Props) => {
    //       return (
    //         <PropsAsPointer {...props}>
    //           {propsP => {
    //             return renderHookie(propsP)
    //           }}
    //         </PropsAsPointer>
    //       )
    //     }
    //   }
  }

  render(): React.ReactNode {
    // if (this._hooksilosa) {
    //   const Hookie = this._hooksilosa
    //   // return
    //   return <Hookie key="hookie" {...this.props} />
    // }

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
