// @flow
import * as React from 'react'
import TheStudioClass from '$studio/TheStudioClass'
import {provideStudio} from './studioContext'
import * as D from '$shared/DataVerse'
import compose from 'ramda/src/compose'
import {elementify} from '$studio/handy'
import DerivationAsReactElement from './DerivationAsReactElement'

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
  class TheaterJSRoot extends React.PureComponent<Props, void> {
    mapAtomOfPropsOfElementify: ElementifyProps

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
        D.derivations.constant(studio)
      )
    }

    componentWillReceiveProps(props) {
      this.instantiationDescriptor.prop('props').prop('children').set(props.children)
    }

    shouldComponentUpdate() {
      return false
    }

    render() {
      return <DerivationAsReactElement key="RenderCurrentCanvas" derivation={this.elementD} />
      // return <Elementify key="RenderCurrentCanvas" props={this.propsOfElementify}  />
    }
  }

  return compose(
    provideStudio(studio),
  )(TheaterJSRoot)
}

export default createRootComponentForReact