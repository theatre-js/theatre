import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Prop.css'
import InternalObject from '$tl/objects/InternalObject'
import * as byType from './byType'

interface IProps {
  css?: Partial<typeof css>
  propKey: string
  internalObject: InternalObject
}

interface IState {}

export default class Prop extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const propKey = props.propKey
    const type = props.internalObject.nativeObjectType.props[propKey]

    const Comp = (byType as $IntentionalAny)[type.type]
    return (
      <Comp
        propKey={propKey}
        internalObject={props.internalObject}
        type={type}
      />
    )
  }
}
