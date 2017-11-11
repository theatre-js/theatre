// @flow
import {type ComponentModelNamespaceState} from './types'
import coreComponentDescriptors from './coreComponentDescriptors'
import coreModifierDescriptors from './coreModifierDescriptors'
import {
  type DeclarativeComponentDescriptor,
  type ComponentInstantiationValueDescriptor,
} from '$studio/componentModel/types'

const FakeDeclarativeButton: DeclarativeComponentDescriptor = {
  id: 'FakeDeclarativeButton',
  type: 'Declarative',
  listOfRulesets: [],
  ruleSetsById: {},
  timelines: {
    byId: {
      timeline1: {
        __descriptorType: 'TimelineDescriptor',
        id: 'timeline1',
        vars: {
          theOpacity: {
            __descriptorType: 'TimelineVarDescriptor',
            id: 'theOpacity',
            backPointer: {
              type: 'PointerThroughLocalHiddenValue',
              localHiddenValueId: 'alaki',
              rest: [
                'modifierInstantiationDescriptors',
                'byId',
                '1',
                'props',
                'pairings',
                'byId',
                '3',
                'value',
              ],
            },
            points: {
              list: ['1', '2'],
              byId: {
                '1': {
                  __descriptorType: 'TimelineVarPoint',
                  time: 0,
                  value: 1,
                  interpolator: {
                    type: 'QubicBezier',
                    lx: 0.5,
                    ly: 0,
                    rx: 0,
                    ry: 1,
                    connected: true,
                  },
                },
                '2': {
                  __descriptorType: 'TimelineVarPoint',
                  time: 0,
                  value: 0,
                  interpolator: {
                    type: 'QubicBezier',
                    lx: 0.5,
                    ly: 0,
                    rx: 0,
                    ry: 1,
                    connected: false,
                  },
                },
              },
            },
          },
        },
      },
    },
    list: ['timeline1'],
  },
  localHiddenValuesById: {
    palaki: ({
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/DOMTag',
      props: {
        tagName: 'div',
        key: 'palaki',
        children: 'palaki',
      },
      modifierInstantiationDescriptors: {byId: {}, list: []},
    }: ComponentInstantiationValueDescriptor),
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
        children: [
          {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'palaki'},
          {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dalaki'},
        ],
      },
      modifierInstantiationDescriptors: {
        byId: {
          '0': {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            modifierId: 'TheaterJS/Core/HTML/SetAttribute',
            props: {
              pairings: {
                list: ['1', '2'],
                byId: {
                  '1': {key: 'id', value: '7'},
                  '2': {key: 'title', value: 'some title'},
                },
              },
            },
          },
          '1': {
            __descriptorType: 'ModifierInstantiationValueDescriptor',
            modifierId: 'TheaterJS/Core/HTML/SetCustomStyle',
            props: {
              pairings: {
                list: ['1', '2', '3'],
                byId: {
                  '1': {key: 'color', value: 'red'},
                  '2': {key: 'font-size', value: '12px'},
                  '3': {
                    key: 'opacity',
                    value: {
                      __descriptorType: 'ReferenceToTimelineVar',
                      timelineId: 'timeline1',
                      varId: 'theOpacity',
                    },
                  },
                },
              },
            },
          },
        },
        list: ['0', '1'],
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
