// @flow
import * as React from 'react'
import {type ComponentInstantiationDescriptor, type ComponentID} from '$studio/componentModel/types' // eslint-disable-line

const createReactElement = (componentID: ComponentID, props: {}) => { // eslint-disable-line
  return <div>{props.children}</div>
}

export default createReactElement