// @flow
import * as React from 'react'
// import RenderCanvas from './RenderCanvas'
import TheStudioClass from '$studio/TheStudioClass'
import {provideTheaterJSStudio} from './studioContext'
import TheaterJSComponent from './TheaterJSComponent'
import DataVerse from '$shared/DataVerse'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'

type Props = {
  children: React.Node,
}

const createRootComponentForReact = (studio: TheStudioClass) => {
  const TheaterJSRoot = (props: Props) => {
    const descriptor: ComponentInstantiationDescriptor = {
      componentID: 'TheaterJS/RenderCurrentCanvas',
      props: {
        children: props.children,
      },
    }

    return <TheaterJSComponent descriptor={DataVerse.fromJS(descriptor)} />
  }

  return provideTheaterJSStudio(studio)(TheaterJSRoot)
}

export default createRootComponentForReact