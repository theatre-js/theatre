
import * as React from 'react'
import TheStudioClass from '$studio/TheStudioClass'
import {provideStudio} from './studioContext'
import Elementify from './Elementify'
import * as D from '$shared/DataVerse'
import compose from 'ramda/src/compose'

type Props = {
  children: React.Node,
}

type ElementifyProps = D.IMapAtom<{
  componentID: 'TheaterJS/Core/RenderCurrentCanvas',
  props: D.IMapAtom<{
    children: D.IBoxAtom<React.Node>,
  }>,
}>

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.PureComponent<Props, void> {
    elementifyProps: ElementifyProps

    constructor(props: Props) {
      super(props)

      this.elementifyProps = new D.MapAtom({
        instantiationDescriptor: new D.MapAtom({
          componentID: 'TheaterJS/Core/RenderCurrentCanvas',
          props: new D.MapAtom({
            children: new D.BoxAtom(props.children),
          }),
        }),
      })
    }

    componentWillReceiveProps(props) {
      this.elementifyProps.prop('props').prop('children').set(props.children)
    }

    render() {
      return <Elementify key="RenderCurrentCanvas" props={this.elementifyProps.pointer()}  />
    }
  }

  return compose(
    provideStudio(studio),
  )(TheaterJSRoot)
}

export default createRootComponentForReact