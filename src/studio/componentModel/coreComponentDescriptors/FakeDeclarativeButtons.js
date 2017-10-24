// @flow
import {type DeclarativeComponentDescriptor} from '$studio/componentModel/types'

const fakeDescriptor: DeclarativeComponentDescriptor = {
  id: 'TheaterJS/Core/FakeDeclarativeButton',
  type: 'Declarative',
  listOfRulesets: [],
  ruleSetsById: {},
  localHiddenValuesById: {
    alaki: {
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'div',
        key: 'theDiv',
        children: 'blahblah',
      },
      modifierInstantiationDescriptors: {
        byId: {
          '0': {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            modifierId: 'TheaterJS/Core/HTML/SetAttribute',
            props: {
              attributeName: 'id',
              value: '6',
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

export default fakeDescriptor