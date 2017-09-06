// @flow
import * as React from 'react'
// import RenderCanvas from './RenderCanvas'
import TheStudioClass from '$studio/TheStudioClass'
import {provideTheaterJSStudio} from './studioContext'
// import Elementify from './Elementify'
import * as D from '$shared/DataVerse'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'

type Props = {
  children: React.Node,
}

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.PureComponent<Props, {descriptor: *}> {
    constructor(props: Props) {
      super(props)

      this.state = {descriptor: new D.MapOfReferences({
        componentID: new D.Reference('TheaterJS/RenderCurrentCanvas'),
        props: new D.MapOfReferences({
          children: new D.Reference(props.children),
        }),
      })};

      // (this.state: ComponentInstantiationDescriptor)
    }

    componentWillReceiveProps(props) {
      this.state.descriptor.get('props').get('children').set(props.children)
    }

    render() {
      return <div>{this.props.children}</div>
      // return <Elementify descriptor={this.state.descriptor} />
    }
  }

  return provideTheaterJSStudio(studio)(TheaterJSRoot)
}

export default createRootComponentForReact