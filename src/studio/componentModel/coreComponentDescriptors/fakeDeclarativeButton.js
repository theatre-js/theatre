// @flow
import {type ComponentDescriptor, type ComponentInstantiationDescriptor} from '$studio/componentModel/types'

const fakeDescriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/RenderCurrentCanvas',
  type: 'Declarative',
  /**
   * <div style={{background: 'rgba(10, 20, 30, 0.4)'}}>
   *   <label style={{color: 'rebeccapurple'>{children}</label>
   * </div>
   */
  ownedComponentInstantiationDescriptors: {
    theDiv: ({
      type: 'ComponentInstantiationDescriptor',
      componentID: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'div',
        children: {
          type: 'ReferenceToLocalValue',
          localValueUniqueID: 'theLabel',
        },
      },
      modifiersByKey: {
        theBG: {
          modifierID: 'TheaterJS/HTML/Style/BackgroundColor',
          props: {
            color: {
              type: 'ValueInstantiationDescriptor',
              constructorID: 'TheaterJS/Core/Colors/RGBA',
              r: 10, g: 20, b: 30, a: 0.4,
            },
          },
        },
      },
      listOfModifiers: [],
    }: ComponentInstantiationDescriptor),
    theLabel: {
      type: 'ComponentInstantiationDescriptor',
      componentID: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'label',
        children: {
          type: 'ReferenceToElementProp',
          propName: 'children',
        },
      },
      listOfModifiers: [],
      modifiersByKey: {
        theColor: {
          modifierID: 'TheaterJS/HTML/Style/TextColor',
          props: {
            color: {
              type: 'ReferenceToValue',
              location: {
                type: 'LocalVariableInOwner',
                valueName: ''
              },
            },
          },
        },
      },
    },
  },
  childrenInTree: {
    type: 'ReferenceToLocalValue',
    localValueUniqueID: 'theDiv',
  },
}

export default fakeDescriptor