import PureComponentWithStudio from '$studio/componentModel/react/utils/PureComponentWithStudio'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import DerivationAsReactElement from '../componentModel/react/utils/DerivationAsReactElement'
import React from 'react'
import Studio from '$studio/bootstrap/Studio'
import atom, {Atom, val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'

const emptyProps = {}

type ChildrenType<InnerProps> = (
  propsP: Pointer<InnerProps>,
  studio: Studio,
) => AbstractDerivation<React.ReactNode> | React.ReactNode

type Props<InnerProps> = {
  props: InnerProps
  children: ChildrenType<InnerProps>
}

export default class PropsAsPointer<
  InnerProps
> extends PureComponentWithStudio<Props<InnerProps>, {}> {
  _atom: Atom<{props: InnerProps; children: ChildrenType<InnerProps>}>
  _renderD: AbstractDerivation<React.ReactNode>
  
  constructor(props: Props<InnerProps>, context: $IntentionalAny) {
    super(props, context)
    this._atom = atom({props: props.props || {}, children: props.children})

    this._renderD = autoDerive(() => {
      const childrenFn = val(this._atom.pointer.children)
      return childrenFn(this._atom.pointer.props, this.studio)
    }).flatten()
  }

  componentWillReceiveProps(newProps: Props<InnerProps>) {
    this._atom.setState({
      props: newProps.props || emptyProps,
      children: newProps.children,
    })
  }

  render() {
    return <DerivationAsReactElement derivation={this._renderD} />
  }
}
