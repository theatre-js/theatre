// @flow
import * as React from 'react'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'
import TheaterJSComponent from './TheaterJSComponent'

const componentInstantiationDescriptorToReactNode = (des: ComponentInstantiationDescriptor): React.Node => {
  /**
   * @todo Feels wasteful to create two entire react elements for each TheaterJS component. We should
   * come up with a better idea.
   */
  return <TheaterJSComponent des={des} />
}

export default componentInstantiationDescriptorToReactNode