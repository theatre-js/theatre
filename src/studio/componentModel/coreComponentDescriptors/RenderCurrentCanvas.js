// @flow
// import {TheaterJSComponent} from '$studio/handy'
import {type ComponentDescriptor} from '$studio/componentModel/types'

// class RenderCurrentCanvas extends TheaterJSComponent<{}, void> {

// }

// const descriptor: ComponentDescriptor = {
//   id: 'TheaterJS/Core/RenderCurrentCanvas',
//   type: 'HardCoded',
//   hardCodedReactComponent: RenderCurrentCanvas,
// }

// export default descriptor

const fakeDescriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/RenderCurrentCanvas',
  type: 'Declarative',
  valuesByLocalValueUniqueID: {},
  childrenInTree: {
    type: 'ReferenceToLocalValue',
    localValueUniqueID: 'hala',
  },
}

export default fakeDescriptor