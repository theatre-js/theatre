// @flow
import * as React from 'react'
import TheStudioClass from '$studio/TheStudioClass'
import {provideTheaterJSStudio} from './studioContext'
import Elementify from './Elementify'
import * as D from '$shared/DataVerse'
import compose from 'ramda/src/compose'

type Props = {
  children: React.Node,
}

type ChildInstantiationDescriptor = D.IMapAtom<{
  componentID: 'TheaterJS/Core/RenderCurrentCanvas',
  props: D.IMapAtom<{
    children: React.Node,
  }>,
}>

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.PureComponent<Props, void> {
    childInstantiationDescriptor: ChildInstantiationDescriptor

    constructor(props: Props) {
      super(props)

      this.childInstantiationDescriptor = new D.MapAtom({
        componentID: 'TheaterJS/Core/RenderCurrentCanvas',
        props: new D.MapAtom({
          children: props.children,
        }),
      })
    }

    componentWillReceiveProps(props) {
      this.childInstantiationDescriptor.prop('props').setProp('children', props.children)
    }

    render() {
      return <Elementify descriptor={this.childInstantiationDescriptor} />
    }
  }

  return compose(
    provideTheaterJSStudio(studio),
  )(TheaterJSRoot)
}

export default createRootComponentForReact