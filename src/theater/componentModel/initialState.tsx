import {
  IComponentModelNamespaceHistoricState,
  IComponentModelNamespaceAhistoricState,
} from './types'
import coreComponentDescriptors from './coreComponentDescriptors/coreComponentDescriptors'
import coreModifierDescriptors from './coreModifierDescriptors/coreModifierDescriptors'
// import {
//   IDeclarativeComponentDescriptor,
//   IComponentInstantiationValueDescriptor,
// } from '$theater/componentModel/types'
import tempCustomComponentDescriptors from './tempBall3'

// const tags = ['div', 'header', 'span', 'footer', 'picture', 'video']

// const generateFakeTree = (maxDepth = 7, maxChildrenPerNode = 3) => {
//   return generate('', maxDepth, maxChildrenPerNode, maxChildrenPerNode)
// }

// const generate = (
//   keyPrefix,
//   maxDepth,
//   maxChildrenPerNode,
//   minChildrenPerNode,
// ) => {
//   const allNodes = {}
//   const rootKeys = []
//   if (maxDepth === 0) {
//     return {allNodes, rootKeys}
//   }
//   const nOfChildren = _.random(minChildrenPerNode, maxChildrenPerNode)

//   for (let i = 0; i < nOfChildren; i++) {
//     const key = keyPrefix + String(i)
//     const {allNodes: allChildNodes, rootKeys: childrenKeys} = generate(
//       key,
//       maxDepth - 1,
//       maxChildrenPerNode,
//       0,
//     )

//     Object.assign(allNodes, allChildNodes)

//     const node = {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/' + tags[_.random(0, tags.length - 1)],
//       props: {
//         key: key,
//         children: childrenKeys.map(k => ({
//           __descriptorType: 'ReferenceToLocalHiddenValue',
//           which: k,
//         })),
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     } as IComponentInstantiationValueDescriptor

//     allNodes[key] = node
//     rootKeys.push(key)
//   }

//   return {allNodes, rootKeys}
// }

// const fakeNodes = generateFakeTree()

// const IntroScene: IDeclarativeComponentDescriptor = {
//   __descriptorType: 'DeclarativeComponentDescriptor',
//   id: 'IntroScene',
//   displayName: 'IntroScene',
//   listOfRulesets: [],
//   ruleSetsById: {},
//   timelineDescriptors: {
//     byId: {
//       defaultTimeline: {
//         __descriptorType: 'TimelineDescriptor',
//         id: 'defaultTimeline',
//         vars: {
//           theOpacity: {
//             __descriptorType: 'TimelineVarDescriptor',
//             id: 'theOpacity',
//             backPointer: {
//               type: 'PointerThroughLocalHiddenValue',
//               localHiddenValueId: 'container',
//               rest: [
//                 'modifierInstantiationDescriptors',
//                 'byId',
//                 '1',
//                 'props',
//                 'pairings',
//                 'byId',
//                 '3',
//                 'value',
//               ],
//             },
//             points: {
//               firstId: '1',
//               lastId: '2',
//               byId: {
//                 '1': {
//                   __descriptorType: 'TimelineVarPoint',
//                   id: '1',
//                   time: 0.5,
//                   value: 0,
//                   prevId: 'head',
//                   nextId: '2',
//                   interpolationDescriptor: {
//                     __descriptorType: 'TimelinePointInterpolationDescriptor',
//                     interpolationType: 'CubicBezier',
//                     lx: 0.5,
//                     ly: 0,
//                     rx: 0,
//                     ry: 1,
//                     connected: true,
//                   },
//                 },
//                 '2': {
//                   __descriptorType: 'TimelineVarPoint',
//                   id: '2',
//                   time: 1,
//                   value: 1,
//                   prevId: '1',
//                   nextId: 'end',
//                   interpolationDescriptor: {
//                     __descriptorType: 'TimelinePointInterpolationDescriptor',
//                     interpolationType: 'CubicBezier',
//                     lx: 0.5,
//                     ly: 0,
//                     rx: 0,
//                     ry: 1,
//                     connected: false,
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     list: ['defaultTimeline'],
//   },
//   localHiddenValuesById: {
//     fontSize: '18px',
//     // ...fakeNodes.allNodes,
//     palakiText: 'Cortana Studios',
//     palakiChild: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/div',
//       props: {
//         key: 'palakiChild',
//         children: [],
//       },
//       modifierInstantiationDescriptors: {
//         byId: {},
//         list: [],
//       },
//     },
//     palaki: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/span',
//       props: {
//         key: 'palaki',
//         children: [
//           {
//             __descriptorType: 'ReferenceToLocalHiddenValue',
//             which: 'palakiChild',
//           },
//           {
//             __descriptorType: 'ReferenceToLocalHiddenValue',
//             which: 'palakiText',
//           },
//         ],
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     } as IComponentInstantiationValueDescriptor,
//     dalaki: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/header',
//       props: {
//         key: 'dalaki',
//         class: 'wrapper',
//         children: [
//           {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'yaru'},
//         ],
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     },
//     dalaki2: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/div',
//       props: {
//         key: 'dalaki2',
//         class: 'underneath',
//         children: [
//           {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'yaru'},
//         ],
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     },
//     yaru: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/div',
//       props: {
//         key: 'yaru',
//         class: 'parts',
//         children: [
//           {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dchch'},
//           {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dchchp'},
//         ],
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     },
//     dchchText: 'Our five styles',
//     dchch: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/div',
//       props: {
//         key: 'dchch',
//         children: {
//           __descriptorType: 'ReferenceToLocalHiddenValue',
//           which: 'dchchText',
//         },
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     },
//     dchchpText: 'Explore the Tango',
//     dchchp: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/div',
//       props: {
//         key: 'dchchp',
//         children: {
//           __descriptorType: 'ReferenceToLocalHiddenValue',
//           which: 'dchchpText',
//         },
//       },
//       modifierInstantiationDescriptors: {byId: {}, list: []},
//     },
//     talaki: 'talaki here',
//     container: {
//       __descriptorType: 'ComponentInstantiationValueDescriptor',
//       componentId: 'TheaterJS/Core/HTML/div',
//       props: {
//         class: 'container',
//         key: 'container',
//         children: [
//           {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'palaki'},
//           {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dalaki'},
//           // {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dalaki2'},
//           // {__descriptorType: 'ReferenceToLocalHiddenValue', which: 'dalaki2'},
//         ],
//       },
//       modifierInstantiationDescriptors: {
//         byId: {
//           '0': {
//             __descriptorType: 'ModifierInstantiationValueDescriptor',
//             modifierId: 'TheaterJS/Core/HTML/SetAttribute',
//             props: {
//               pairings: {
//                 list: ['1', '2'],
//                 byId: {
//                   '1': {key: 'id', value: '7'},
//                   '2': {key: 'title', value: 'some title'},
//                 },
//               },
//             },
//           },
//           '1': {
//             __descriptorType: 'ModifierInstantiationValueDescriptor',
//             modifierId: 'TheaterJS/Core/HTML/SetCustomStyle',
//             props: {
//               pairings: {
//                 list: ['1', '2', '3'],
//                 byId: {
//                   '1': {key: 'color', value: 'red'},
//                   '2': {
//                     key: 'font-size',
//                     value: {
//                       __descriptorType: 'ReferenceToLocalHiddenValue',
//                       which: 'fontSize',
//                     },
//                   },
//                   '3': {
//                     key: 'opacity',
//                     value: '0.0',
//                   },
//                 },
//               },
//             },
//           },
//         },
//         list: ['0', '1'],
//       },
//     },
//   },
//   whatToRender: {
//     __descriptorType: 'ReferenceToLocalHiddenValue',
//     which: 'container',
//   },
//   // whatToRender: 'hi',
// }

export const historicInitialState: IComponentModelNamespaceHistoricState = {
  customComponentDescriptors: tempCustomComponentDescriptors,
}

export const ahistoricInitialState: IComponentModelNamespaceAhistoricState = {
  coreComponentDescriptors,
  coreModifierDescriptors,
  collapsedElementsByVolatileId: {}
}
