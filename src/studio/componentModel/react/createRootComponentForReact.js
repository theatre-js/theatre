
import * as React from 'react'
import TheStudioClass from '$studio/TheStudioClass'
import {provideStudio} from './studioContext'
import Elementify from './Elementify'
import * as D from '$shared/DataVerse'
import compose from 'ramda/src/compose'

type Props = {
  children: React.Node,
}

type ElementifyProps = D.IDictAtom<{
  componentID: 'TheaterJS/Core/RenderCurrentCanvas',
  props: D.IDictAtom<{
    children: D.IBoxAtom<React.Node>,
  }>,
}>

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.PureComponent<Props, void> {
    mapAtomOfPropsOfElementify: ElementifyProps

    constructor(props: Props) {
      super(props)

      this.mapAtomOfPropsOfElementify =D.atoms.dict({
        instantiationDescriptor:D.atoms.dict({
          componentID: 'TheaterJS/Core/RenderCurrentCanvas',
          props:D.atoms.dict({
            children: D.atoms.box(props.children),
          }),
        }),
      })
      this.propsOfElementify = this.mapAtomOfPropsOfElementify.derivedDict().pointer()
    }

    componentWillReceiveProps(props) {
      this.mapAtomOfPropsOfElementify.prop('props').prop('children').set(props.children)
    }

    render() {
      return <Elementify key="RenderCurrentCanvas" props={this.propsOfElementify}  />
    }
  }

  return compose(
    provideStudio(studio),
  )(TheaterJSRoot)
}

export default createRootComponentForReact