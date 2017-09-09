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

type ChildInstantiationDescriptor = $Call<typeof D.referencifyDeep, {
  componentID: 'TheaterJS/Core/RenderCurrentCanvas',
  props: {
    children: D.Reference<React.Node>,
  },
}>

const createRootComponentForReact = (studio: TheStudioClass) => {
  class TheaterJSRoot extends React.PureComponent<Props, void> {
    childInstantiationDescriptor: ChildInstantiationDescriptor

    constructor(props: Props) {
      super(props)

      this.childInstantiationDescriptor = D.referencifyDeep({
        componentID: 'TheaterJS/Core/RenderCurrentCanvas',
        props: {
          children: new D.Reference(props.children),
        },
      })
    }

    componentWillReceiveProps(props) {
      this.childInstantiationDescriptor.get('props').get('children').set(props.children)
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