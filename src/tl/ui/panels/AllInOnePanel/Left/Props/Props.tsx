import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Props.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import InternalObject from '$tl/objects/InternalObject'

interface IProps {
  css?: Partial<typeof css>
  internalObject: InternalObject
}

interface IState {}

export default class Props extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)

    return <div {...classes('container')}>props</div>
  }
}
