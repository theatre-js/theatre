// @flow
import {type DeclarativeComponentDescriptor, type ComponentInstantiationValueDescriptor} from '$studio/componentModel/types'

const fakeDescriptor: DeclarativeComponentDescriptor = {
  id: 'TheaterJS/Core/FakeDeclarativeButton',
  type: 'Declarative',
  listOfRulesets: [],
  ruleSetsByID: {},
  /**
   * <div style={{background: 'rgba(10, 20, 30, 0.4)'}}> // theDiv
   *   <label style={{color: 'rebeccapurple'>{children}</label> // theLabel
   * </div>
   */
  localHiddenValuesByID: {
    // alaki: {
    //   type: 'ComponentInstantiationValueDescriptor',
    //   componentID: 'TheaterJS/Core/RenderSomethingStupid',
    //   props: {
    //     type: 'MapDescriptor',
    //     values: {
    //       foo: 'foo is here',
    //     },
    //   },
    //   modifierInstantiationDescriptorsByID: {
    //     type: 'MapDescriptor',
    //     values: {
    //       '0': {
    //         type: 'ModifierInstantiationValueDescriptor',
    //         modifierID: 'TheaterJS/Core/DOMTag/SetAttribute',
    //         props: {
    //           type: 'MapDescriptor',
    //           values: {
    //             attributeName: 'id',
    //             value: 'hihi',
    //           },
    //         },
    //       },
    //     },
    //   },
    //   listOfModifierInstantiationDescriptorIDs: [],
    // },
    alaki: {
      type: 'ComponentInstantiationValueDescriptor',
      componentID: 'TheaterJS/Core/DOMTag',
      props: {
        type: 'MapDescriptor',
        values: {
          tagName: 'div',
        },
      },
      modifierInstantiationDescriptorsByID: {
        type: 'MapDescriptor',
        values: {
          '0': {
            type: 'ModifierInstantiationValueDescriptor',
            modifierID: 'TheaterJS/Core/DOMTag/SetAttribute',
            props: {
              type: 'MapDescriptor',
              values: {
                attributeName: 'id',
                value: 'hihi',
              },
            },
          },
        },
      },
      listOfModifierInstantiationDescriptorIDs: [],
    },
    // theDiv: {
    //   type: 'ComponentInstantiationValueDescriptor',
    //   componentID: 'TheaterJS/Core/DOMTag',
      // props: {
      //   type: 'MapDescriptor',
      //   values: {
      //     tagName: 'div',
      //     children: {
      //       type: 'ReferenceToLocalHiddenValue',
      //       which: 'theLabel',
      //     },
      //   },
      // },
      // modifiersByKey: {
      //   theBG: {
      //     modifierID: 'TheaterJS/HTML/Style/BackgroundColor',
      //     props: {
      //       color: {
      //         type: 'ValueInstantiationDescriptor',
      //         constructorID: 'TheaterJS/Core/Colors/RGBA',
      //         r: 10, g: 20, b: 30, a: 0.4,
      //       },
      //     },
      //   },
      // },
      // listOfModifiers: [],
    // },
    // theLabel: {
    //   type: 'ComponentInstantiationValueDescriptor',
    //   componentID: 'TheaterJS/Core/DOMTag',
    //   props: {
    //     tagName: 'label',
    //     children: {
    //       type: 'ReferenceToElementProp',
    //       propName: 'children',
    //     },
    //   },
      // listOfModifiers: [],
      // modifiersByKey: {
      //   theColor: {
      //     modifierID: 'TheaterJS/HTML/Style/TextColor',
      //     props: {
      //       color: {
      //         type: 'ReferenceToValue',
      //         location: {
      //           type: 'LocalVariableInOwner',
      //           valueName: '',
      //         },
      //       },
      //     },
      //   },
      // },
    // },
  },
  whatToRender: {
    type: 'ReferenceToLocalHiddenValue',
    which: 'alaki',
  },
}

export default fakeDescriptor