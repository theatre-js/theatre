// @flow
import * as React from 'react'
// import RenderCanvas from './RenderCanvas'
import TheStudioClass from '$studio/TheStudioClass'
import {provideTheaterJSStudio} from './studioContext'
import Elementify from './Elementify'
import * as D from '$shared/DataVerse'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'

type Props = {
  children: React.Node,
}

type ChildInstantiationDescriptor = D.ReferencifyDeepObject<{
  componentID: 'TheaterJS/RenderCurrentCanvas',
  props: {
    children: D.Reference<React.Node>,
  },
}>

type State = {
  childInstantiationDescriptor: ChildInstantiationDescriptor,
}

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props)

      this.state = {childInstantiationDescriptor: D.referencifyDeep({
        componentID: 'TheaterJS/RenderCurrentCanvas',
        props: {
          children: new D.Reference(props.children),
        },
      })}
    }

    componentWillReceiveProps(props) {
      this.state.childInstantiationDescriptor.get('props').get('children').set(props.children)
    }

    render() {
      return <Elementify descriptor={this.state.childInstantiationDescriptor} />
    }
  }

  return provideTheaterJSStudio(studio)(TheaterJSRoot)
}

export default createRootComponentForReact