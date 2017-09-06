// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import * as React from 'react'
import TheaterJSComponent from '$studio/componentModel/react/TheaterJSComponent'

class PassThroughReactComponent extends TheaterJSComponent {
  getRenderDerivative() {

  }
}

const PassThroughComponent: ComponentDescriptor = {
  componentID: 'TheaterJS/Core/PassThroughComponent',
  componentType: 'Primitive',
  reactComponent: PassThroughReactComponent,
}

export default PassThroughComponent