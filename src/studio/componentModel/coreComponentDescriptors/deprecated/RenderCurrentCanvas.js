import {type ComponentDescriptor} from '$studio/componentModel/types'
import TheaterJSComponent from '$studio/componentModel/react/TheaterJSComponent'

class RenderCurrentCanvas extends TheaterJSComponent {
  getRenderDerivative() {

  }
}

const descriptor: ComponentDescriptor = {
  componentID: 'TheaterJS/Core/RenderCurrentCanvas',
  componentType: 'Primitive',
  reactComponent: RenderCurrentCanvas,
}

export default descriptor