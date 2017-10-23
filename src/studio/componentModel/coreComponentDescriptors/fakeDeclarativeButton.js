// @flow
import {type DeclarativeComponentDescriptor} from '$studio/componentModel/types'

const fakeDescriptor: DeclarativeComponentDescriptor = {
  id: 'TheaterJS/Core/FakeDeclarativeButton',
  type: 'Declarative',
  listOfRulesets: [],
  ruleSetsById: {},
  localHiddenValuesById: {
    alaki: {
      type: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/DOMTag',
      props: {
        type: 'MapDescriptor',
        values: {
          tagName: 'div',
          key: 'theDiv',
        },
      },
      modifierInstantiationDescriptors: {
        byId: {
          type: 'MapDescriptor',
          values: {
            '0': {
              type: 'ModifierInstantiationValueDescriptor',
              modifierId: 'TheaterJS/Core/HTML/SetAttribute',
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
        list: ['0'],
      },
    },
  },
  whatToRender: {
    type: 'ReferenceToLocalHiddenValue',
    which: 'alaki',
  },
}

export default fakeDescriptor