// @flow
import {type ComponentModelNamespaceState} from './types'
import coreComponentDescriptors from './coreComponentDescriptors'
import coreModifierDescriptors from './coreModifierDescriptors'
import {type DeclarativeComponentDescriptor} from '$studio/componentModel/types'

const FakeDeclarativeButton: DeclarativeComponentDescriptor = {
  id: 'FakeDeclarativeButton',
  type: 'Declarative',
  listOfRulesets: [],
  ruleSetsById: {},
  localHiddenValuesById: {
    palaki: {
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'div',
        key: 'palaki',
        children: 'palaki',
      },
      modifierInstantiationDescriptors: {byId: {}, list: []},
    },
    dalaki: {
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'div',
        key: 'dalaki',
        children: 'dalaki',
      },
      modifierInstantiationDescriptors: {byId: {}, list: []},
    },
    talaki: 'talaki here',
    alaki: {
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'div',
        class: 'Alaki',
        key: 'alaki',
        // children: {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'palaki'},
        // children: {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'talaki'},
        // children: 'hello there',
        children: [{__descriptorType: 'ReferenceToLocalHiddenValue', which: 'palaki'}, {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dalaki'}],
      },
      modifierInstantiationDescriptors: {
        byId: {
          '0': {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            modifierId: 'TheaterJS/Core/HTML/SetAttribute',
            props: {
              attributeName: 'id',
              value: '7',
            },
          },
        },
        list: ['0'],
      },
    },
  },
  whatToRender: {
    __descriptorType: 'ReferenceToLocalHiddenValue',
    which: 'alaki',
  },
}

const initialState: ComponentModelNamespaceState = {
  componentDescriptors: {
    core: coreComponentDescriptors,
    custom: {
      FakeDeclarativeButton,
    },
  },
  modifierDescriptors: {
    core: coreModifierDescriptors,
  },
}

export default initialState