import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import DerivationAsReactElement from '$shared/utils/react/DerivationAsReactElement'
import React, {PureComponent} from 'react'
import atom, {Atom, val} from '$shared/DataVerse/atom'
import {Pointer} from '$shared/DataVerse/pointer'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'

const emptyProps = {}

type ChildrenType<InnerProps> = (
  propsP: Pointer<InnerProps>,
) => $IntentionalAny /* AbstractDerivation<React.ReactNode> | React.ReactNode */

type Props<InnerProps extends {}> = InnerProps & {
  children: ChildrenType<InnerProps>
}

// type PropsWithoutChildren<InnerProps extends {}> = {
//   [Key in Exclude<keyof InnerProps, 'children'>]: InnerProps[Key]
// }

// type Props<InnerProps extends {}> = PropsWithoutChildren<InnerProps> & {
//   children: ChildrenType<PropsWithoutChildren<InnerProps>>
// }

export default class PropsAsPointer<
  InnerProps extends {}
> extends PureComponent<Props<InnerProps>, {}> {
  _atom: Atom<{props: InnerProps; children: ChildrenType<InnerProps>}>
  _renderD: AbstractDerivation<React.ReactNode>
  _stringOfLastChldren: string

  constructor(props: Props<InnerProps>, context: $IntentionalAny) {
    super(props, context)
    const {children, ...rest} = props as $IntentionalAny
    this._atom = atom({props: rest || {}, children})
    this._stringOfLastChldren = children.toString()

    this._renderD = autoDerive(() => {
      const childrenFn = val(this._atom.pointer.children)
      return childrenFn(this._atom.pointer.props)
    }).flatten()
  }

  componentWillReceiveProps(newProps: Props<InnerProps>) {
    const {children, ...rest} = newProps as $IntentionalAny
    let newChildren = this.props.children
    if (children !== this.props.children) {
      const stringOfChildren = children.toString()
      if (stringOfChildren !== this._stringOfLastChldren) {
        this._stringOfLastChldren = stringOfChildren
        newChildren = children
      }
    }

    this._atom.setState({
      props: rest || emptyProps,
      children: newChildren,
    })
  }

  render() {
    return <DerivationAsReactElement derivation={this._renderD} />
  }
}

// export const PropsAsPointer2: <InnerProps extends {}>(props: Props<InnerProps>) => React.ReactNode = null as $IntentionalAny
