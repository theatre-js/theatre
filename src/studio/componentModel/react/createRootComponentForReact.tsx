import * as React from 'react'
import TheaterJSStudio from '$studio/bootstrap/TheaterJSStudio'
import {contextTypes, contextName} from './utils/studioContext'
import {elementify} from '$studio/handy'
import DerivationAsReactElement from './utils/DerivationAsReactElement'
import dictAtom from '$src/shared/DataVerse/atoms/dict'
import boxAtom from '$src/shared/DataVerse/atoms/box'
import arrayAtom from '$src/shared/DataVerse/atoms/array'
import constant from '$src/shared/DataVerse/derivations/constant'

interface Props {
  children: React.ReactNode
}

// type ElementifyProps = DictAtom<{
//   componentId: 'TheaterJS/Core/RenderCurrentCanvas',
//   props: DictAtom<{
//     children: BoxAtom<React.Node>,
//   }>,
// }>
type ElementifyProps = $FixMe

const createRootComponentForReact = (studio: TheaterJSStudio) => {
  class TheaterJSRoot extends React.Component<Props, {}> {
    elementD: $FixMe
    mapAtomOfPropsOfElementify: ElementifyProps
    instantiationDescriptor: $FixMe

    constructor(props: Props) {
      super(props)

      this.instantiationDescriptor = dictAtom({
        componentId: 'TheaterJS/Core/RenderCurrentCanvas',
        props: dictAtom({
          children: boxAtom(props.children),
        }),
        modifierInstantiationDescriptors: dictAtom({
          byId: dictAtom({}),
          list: arrayAtom([]),
        }),
      })
      this.elementD = elementify(
        constant(`RenderCurrentCanvas`),
        this.instantiationDescriptor.derivedDict().pointer(),
        constant(studio),
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

    static childContextTypes = contextTypes
  }

  return TheaterJSRoot
}

export default createRootComponentForReact
