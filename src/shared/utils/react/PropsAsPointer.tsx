import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import DerivationAsReactElement from '$shared/utils/react/DerivationAsReactElement'
import React, {PureComponent} from 'react'
import atom, {Atom, val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'

const emptyProps = {}

type ChildrenType<InnerProps> = (
  propsP: Pointer<InnerProps>,
) => AbstractDerivation<React.ReactNode> | React.ReactNode

type Props<InnerProps extends {}> = InnerProps & {
  children: ChildrenType<InnerProps>
}

export default class PropsAsPointer<
  InnerProps extends {}
> extends PureComponent<Props<InnerProps>, {}> {
  _atom: Atom<{props: InnerProps; children: ChildrenType<InnerProps>}>
  _renderD: AbstractDerivation<React.ReactNode>

  constructor(props: Props<InnerProps>, context: $IntentionalAny) {
    super(props, context)
    const {children, ...rest} = props as $IntentionalAny
    this._atom = atom({props: rest || {}, children})

    this._renderD = autoDerive(() => {
      const childrenFn = val(this._atom.pointer.children)
      return childrenFn(this._atom.pointer.props)
    }).flatten()
  }

  componentWillReceiveProps(newProps: Props<InnerProps>) {
    const {children, ...rest} = newProps as $IntentionalAny

    this._atom.setState({
      props: rest || emptyProps,
      children,
    })
  }

  render() {
    return <DerivationAsReactElement derivation={this._renderD} />
  }
}
