// @flow
import * as React from 'react'
import TheStudioClass from '$studio/TheStudioClass'
import {contextTypes, contextName} from './utils/studioContext'
import * as D from '$shared/DataVerse'
import {elementify} from '$studio/handy'
import DerivationAsReactElement from './utils/DerivationAsReactElement'

type Props = {
  children: React.Node,
}

type ElementifyProps = D.IDictAtom<{
  componentId: 'TheaterJS/Core/RenderCurrentCanvas',
  props: D.IDictAtom<{
    children: D.IBoxAtom<React.Node>,
  }>,
}>

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.Component<Props, void> {
    elementD: $FixMe
    mapAtomOfPropsOfElementify: ElementifyProps
    instantiationDescriptor: $FixMe

    constructor(props: Props) {
      super(props)

      this.instantiationDescriptor = D.atoms.dict({
        componentId: 'TheaterJS/Core/RenderCurrentCanvas',
        props: D.atoms.dict({
          children: D.atoms.box(props.children),
        }),
        modifierInstantiationDescriptors: D.atoms.dict({
          byId: D.atoms.dict({}),
          list: D.atoms.array([]),
        }),
      })
      this.elementD = elementify(
        D.derivations.constant(`RenderCurrentCanvas`),
        this.instantiationDescriptor.derivedDict().pointer(),
        D.derivations.constant(studio),
      )
    }

    componentWillReceiveProps(props: Props) {
      this.instantiationDescriptor
        .prop('props')
        .prop('children')
        .set(props.children)
    }

    shouldComponentUpdate() {
      return false
    }

    render() {
      return (
        <DerivationAsReactElement
          key="RenderCurrentCanvas"
          derivation={this.elementD}
        />
      )
      // return <Elementify key="RenderCurrentCanvas" props={this.propsOfElementify}  />
    }

    getChildContext() {
      return {[contextName]: studio}
    }
  }

  TheaterJSRoot.childContextTypes = contextTypes

  return TheaterJSRoot
}

export default createRootComponentForReact
