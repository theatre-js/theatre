// @flow
import {type ComponentModelNamespaceState} from './types'
import coreComponentDescriptors from './coreComponentDescriptors'
import coreModifierDescriptors from './coreModifierDescriptors'
import {
  type DeclarativeComponentDescriptor,
  type ComponentInstantiationValueDescriptor,
} from '$studio/componentModel/types'
import * as _ from 'lodash'

const tags = ['div', 'header', 'span', 'footer', 'picture', 'video']

const generateFakeTree = (maxDepth = 7, maxChildrenPerNode = 3) => {
  return generate('', maxDepth, maxChildrenPerNode, maxChildrenPerNode)
}

const generate = (
  keyPrefix,
  maxDepth,
  maxChildrenPerNode,
  minChildrenPerNode,
) => {
  const allNodes = {}
  const rootKeys = []
  if (maxDepth === 0) {
    return {allNodes, rootKeys}
  }
  const nOfChildren = _.random(minChildrenPerNode, maxChildrenPerNode)

  for (let i = 0; i < nOfChildren; i++) {
    const key = keyPrefix + String(i)
    const {allNodes: allChildNodes, rootKeys: childrenKeys} = generate(
      key,
      maxDepth - 1,
      maxChildrenPerNode,
      0,
    )

    Object.assign(allNodes, allChildNodes)

    const node = ({
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/HTML/' + tags[_.random(0, tags.length - 1)],
      props: {
        key: key,
        children: childrenKeys.map(k => ({
          __descriptorType: 'ReferenceToLocalHiddenValue',
          which: k,
        })),
      },
      modifierInstantiationDescriptors: {byId: {}, list: []},
    }: ComponentInstantiationValueDescriptor)

    allNodes[key] = node
    rootKeys.push(key)
  }

  return {allNodes, rootKeys}
}

const fakeNodes = generateFakeTree()

const FakeDeclarativeButton: DeclarativeComponentDescriptor = {
  __descriptorType: 'DeclarativeComponentDescriptor',
  id: 'FakeDeclarativeButton',
  displayName: 'FakeDeclarativeButton',
  type: 'Declarative',
  listOfRulesets: [],
  ruleSetsById: {},
  timelineDescriptors: {
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
              firstId: '1',
              lastId: '2',
              byId: {
                '1': {
                  __descriptorType: 'TimelineVarPoint',
                  id: '1',
                  time: 0.5,
                  value: 0,
                  prevId: 'head',
                  nextId: '2',
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    lx: 0.5,
                    ly: 0,
                    rx: 0,
                    ry: 1,
                    connected: true,
                  },
                },
                '2': {
                  __descriptorType: 'TimelineVarPoint',
                  id: '2',
                  time: 1,
                  value: 1,
                  prevId: '1',
                  nextId: 'end',
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
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
    fontSize: '18px',
    ...fakeNodes.allNodes,
    palaki: ({
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/HTML/div',
      props: {
        tagName: 'div',
        key: 'palaki',
        children: 'palaki',
      },
      modifierInstantiationDescriptors: {byId: {}, list: []},
    }: ComponentInstantiationValueDescriptor),
    dalaki: {
      __descriptorType: 'ComponentInstantiationValueDescriptor',
      componentId: 'TheaterJS/Core/HTML/div',
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
      componentId: 'TheaterJS/Core/HTML/div',
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
          ...fakeNodes.rootKeys.map(k => ({
            __descriptorType: 'ReferenceToLocalHiddenValue',
            which: k,
          })),
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
                  '2': {
                    key: 'font-size',
                    value: {
                      __descriptorType: 'ReferenceToLocalHiddenValue',
                      which: 'fontSize',
                    },
                  },
                  '3': {
                    key: 'opacity',
                    value: '0.2',
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
