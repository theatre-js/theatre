const tempCustomComponentDescriptors = {
  IntroScene: {
    __descriptorType: 'DeclarativeComponentDescriptor',
    id: 'IntroScene',
    displayName: 'IntroScene',
    type: 'Declarative',
    listOfRulesets: [],
    ruleSetsById: {},
    timelineDescriptors: {
      byId: {
        timeline1: {
          __descriptorType: 'TimelineDescriptor',
          id: 'timeline1',
          variables: {
            theOpacity: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'theOpacity',
              component: 'button', // temp
              property: 'bottom', // temp
              extremums: [0, 60], // temp
              backPointer: {
                type: 'PointerThroughLocalHiddenValue',
                localHiddenValueId: 'container',
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
              points: [
                {
                  __descriptorType: 'TimelineVarPoint',
                  id: '1',
                  time: 0.1,
                  value: 1000,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0, 1],
                    connected: true,
                  },
                },
                {
                  __descriptorType: 'TimelineVarPoint',
                  id: '2',
                  time: 1,
                  value: 500,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0, 1],
                    connected: false,
                  },
                },
              ],
              // firstId: '1',
              // lastId: '2',
              // byId: {
              //   '1': {
              //     __descriptorType: 'TimelineVarPoint',
              //     id: '1',
              //     time: 0,
              //     value: 1000,
              //     prevId: 'head',
              //     nextId: '2',
              //     interpolationDescriptor: {
              //       __descriptorType: 'TimelinePointInterpolationDescriptor',
              //       interpolationType: 'CubicBezier',
              //       handles: [0.5, 0, 0, 1],
              //       connected: true,
              //     },
              //   },
              //   '2': {
              //     __descriptorType: 'TimelineVarPoint',
              //     id: '2',
              //     time: 1,
              //     value: 500,
              //     prevId: '1',
              //     nextId: 'end',
              //     interpolationDescriptor: {
              //       __descriptorType: 'TimelinePointInterpolationDescriptor',
              //       interpolationType: 'CubicBezier',
              //       handles: [0.5, 0, 0, 1],
              //       connected: false,
              //     },
              //   },
              // },
              // },
            },
          },
        },
        '8daa7380-9b43-475a-8352-dc564a58c710': {
          variables: {
            '8daa7380-9b43-475a-8352-dc564a58c717': {
              id: '8daa7380-9b43-475a-8352-dc564a58c717',
              component: 'button',
              property: 'bottom',
              extremums: [0, 60],
              points: [
                {
                  time: 10000,
                  value: 20,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 20000,
                  value: 10,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 30000,
                  value: 30,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 50000,
                  value: 5,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: false,
                  },
                },
              ],
            },
            '8daa7380-9b43-475a-8352-dc564a58c716': {
              id: '8daa7380-9b43-475a-8352-dc564a58c716',
              component: 'button',
              property: 'left',
              extremums: [-20, 40],
              points: [
                {
                  time: 30000,
                  value: 20,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 40000,
                  value: 10,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 50000,
                  value: 30,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 55000,
                  value: -5,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: false,
                  },
                },
              ],
            },
            '8daa7380-9b43-475a-8352-dc564a58c715': {
              id: '8daa7380-9b43-475a-8352-dc564a58c715',
              component: 'SamplePlayground',
              property: 'top',
              extremums: [0, 60],
              points: [
                {
                  time: 10000,
                  value: 50,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 20000,
                  value: 10,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 31000,
                  value: 50,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 43000,
                  value: 5,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: false,
                  },
                },
              ],
            },
            '8daa7380-9b43-475a-8352-dc564a58c714': {
              id: '8daa7380-9b43-475a-8352-dc564a58c714',
              component: 'SamplePlayground',
              property: 'left',
              extremums: [0, 60],
              points: [
                {
                  time: 5000,
                  value: 25,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 17000,
                  value: 15,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 29000,
                  value: 35,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: true,
                  },
                },
                {
                  time: 40000,
                  value: 10,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [-0.2, 0, 0.2, 0],
                    connected: false,
                  },
                },
              ],
            },
            '8daa7380-9b43-475a-8352-dc564a58c713': {
              id: '8daa7380-9b43-475a-8352-dc564a58c713',
              component: 'div',
              property: 'top',
              extremums: [-10, 60],
              points: [],
            },
          },
          layout: ['8daa7380-9b43-475a-8352-dc564a58c726'],
          boxes: {
            '8daa7380-9b43-475a-8352-dc564a58c726': {
              id: '8daa7380-9b43-475a-8352-dc564a58c726',
              height: 294,
              variables: [
                '8daa7380-9b43-475a-8352-dc564a58c716',
                '8daa7380-9b43-475a-8352-dc564a58c717',
                '8daa7380-9b43-475a-8352-dc564a58c715',
                '8daa7380-9b43-475a-8352-dc564a58c714',
                '8daa7380-9b43-475a-8352-dc564a58c713',
              ],
            },
          },
        },
      },
      list: ['timeline1'],
    },
    localHiddenValuesById: {
      fontSize: '18px',
      container: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        componentId: 'TheaterJS/Core/HTML/div',
        props: {
          class: 'container',
          key: 'container',
          children: [],
        },
        modifierInstantiationDescriptors: {
          byId: {
            '1': {
              __descriptorType: 'ModifierInstantiationValueDescriptor',
              modifierId: 'TheaterJS/Core/HTML/UberModifier',
              props: {
                translationX: {
                  __descriptorType: 'ReferenceToTimelineVar',
                  timelineId: 'timeline1',
                  varId: 'theOpacity',
                },
                translationY: 2,
                translationZ: 3,
              },
              enabled: true,
            },
          },
          list: ['1'],
        },
      },
    },
    whatToRender: {
      __descriptorType: 'ReferenceToLocalHiddenValue',
      which: 'container',
    },
    meta: {
      composePanel: {
        selectedNodeId: 'container',
      },
    },
  },
  // }

  // {
  // IntroScene: {
  //   __descriptorType: 'DeclarativeComponentDescriptor',
  //   id: 'IntroScene',
  //   displayName: 'IntroScene',
  //   type: 'Declarative',
  //   listOfRulesets: [],
  //   ruleSetsById: {},
  //   timelineDescriptors: {
  //     byId: {
  //       timeline1: {
  //         __descriptorType: 'TimelineDescriptor',
  //         id: 'timeline1',
  //         variables: {
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
  //     list: ['timeline1'],
  //   },
  //   localHiddenValuesById: {
  //     fontSize: '18px',
  //     palakiText: 'Carona Studios',
  //     palakiChild: {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'palakiChild',
  //         children: [],
  //         class: 'logo',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/h1',
  //     },
  //     palaki: {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
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
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'e4cba24e-facd-42a1-a424-ce83d96b8e93',
  //           },
  //         ],
  //         class: 'heading',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/header',
  //     },
  //     dalaki2: {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       componentId: 'TheaterJS/Core/HTML/div',
  //       props: {
  //         key: 'dalaki2',
  //         class: 'underneath',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'yaru',
  //           },
  //         ],
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //     },
  //     yaru: {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       componentId: 'TheaterJS/Core/HTML/div',
  //       props: {
  //         key: 'yaru',
  //         class: 'parts',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'dchch',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'dchchp',
  //           },
  //         ],
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
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
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
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
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //     },
  //     talaki: 'talaki here',
  //     container: {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       componentId: 'TheaterJS/Core/HTML/div',
  //       props: {
  //         class: 'container',
  //         key: 'container',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'palaki',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '63b6bcf3-8c51-4c05-b91c-d0a32603c040',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'a1f96e23-9c80-40d7-a0d4-8629c46d301b',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '09d5ac3f-abf0-4687-b17b-5effddffa113',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '4afae757-3d49-4797-9153-0cb2a57e277b',
  //           },
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
  //                   '1': {
  //                     key: 'id',
  //                     value: '7',
  //                   },
  //                   '2': {
  //                     key: 'title',
  //                     value: 'some title',
  //                   },
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
  //                   '1': {
  //                     key: 'color',
  //                     value: 'red',
  //                   },
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
  //     'e4cba24e-facd-42a1-a424-ce83d96b8e93': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'e4cba24e-facd-42a1-a424-ce83d96b8e93',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '1ed9bab7-2136-4090-970e-609842f056b2',
  //           },
  //         ],
  //         class: 'sub',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/span',
  //     },
  //     '1ed9bab7-2136-4090-970e-609842f056b2': 'Est. 1912',
  //     '63b6bcf3-8c51-4c05-b91c-d0a32603c040': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '63b6bcf3-8c51-4c05-b91c-d0a32603c040',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '1584b97b-3f0a-433f-8f63-56360e3cd5ef',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '567fec79-6d45-4cf5-94fe-2d1925b87a4c',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'b5752132-482c-452a-9b21-48fd8e2907fe',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '1801ec5b-32f5-46fe-8a21-a42d4c5f1424',
  //           },
  //         ],
  //         class: 'navigation',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/ul',
  //     },
  //     '1584b97b-3f0a-433f-8f63-56360e3cd5ef': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '1584b97b-3f0a-433f-8f63-56360e3cd5ef',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '3c8b1be6-d960-4278-a37e-e13c2c558875',
  //           },
  //         ],
  //         class: 'nav item',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/li',
  //     },
  //     '3c8b1be6-d960-4278-a37e-e13c2c558875': 'Our history',
  //     'b5752132-482c-452a-9b21-48fd8e2907fe': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'b5752132-482c-452a-9b21-48fd8e2907fe',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '33e7e0b0-adaf-4a22-b30d-0ecb65794f16',
  //           },
  //         ],
  //         class: 'nav item',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/li',
  //     },
  //     '33e7e0b0-adaf-4a22-b30d-0ecb65794f16': 'Hall of fame',
  //     '567fec79-6d45-4cf5-94fe-2d1925b87a4c': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '567fec79-6d45-4cf5-94fe-2d1925b87a4c',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'f0d28ba5-b937-4f60-899b-07cfdbf26883',
  //           },
  //         ],
  //         class: 'nav item',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/li',
  //     },
  //     'f0d28ba5-b937-4f60-899b-07cfdbf26883': 'Engineering',
  //     '1801ec5b-32f5-46fe-8a21-a42d4c5f1424': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '1801ec5b-32f5-46fe-8a21-a42d4c5f1424',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '25cd5313-1b6f-4599-ad70-2e1a7b00cb42',
  //           },
  //         ],
  //         class: 'nav item',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/li',
  //     },
  //     '25cd5313-1b6f-4599-ad70-2e1a7b00cb42': 'Get in touch',
  //     'a1f96e23-9c80-40d7-a0d4-8629c46d301b': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'a1f96e23-9c80-40d7-a0d4-8629c46d301b',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '3a259774-b8d3-443d-918c-b19fe038c8dd',
  //           },
  //         ],
  //         class: 'body',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/section',
  //     },
  //     '3a259774-b8d3-443d-918c-b19fe038c8dd': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '3a259774-b8d3-443d-918c-b19fe038c8dd',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'adffd8ee-aeb8-41c6-ad46-6792e31c1141',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '1e156175-970e-468b-9bf7-9c6a97443cc5',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'c723f772-1125-4fac-af3e-fe5d561cbded',
  //           },
  //         ],
  //         class: 'hero',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/div',
  //     },
  //     'adffd8ee-aeb8-41c6-ad46-6792e31c1141': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'adffd8ee-aeb8-41c6-ad46-6792e31c1141',
  //         children: [],
  //         class: 'background',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/picture',
  //     },
  //     '1e156175-970e-468b-9bf7-9c6a97443cc5': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '1e156175-970e-468b-9bf7-9c6a97443cc5',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '4eca56d0-8d10-49ef-861e-13cc8f894d05',
  //           },
  //         ],
  //         class: 'action',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/button',
  //     },
  //     '4eca56d0-8d10-49ef-861e-13cc8f894d05': 'Be part',
  //     'c723f772-1125-4fac-af3e-fe5d561cbded': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'c723f772-1125-4fac-af3e-fe5d561cbded',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '1ece31da-b4da-4059-a1a3-7031eb04803e',
  //           },
  //         ],
  //         class: 'The copy',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/p',
  //     },
  //     '1ece31da-b4da-4059-a1a3-7031eb04803e': 'Awesome copy here',
  //     '09d5ac3f-abf0-4687-b17b-5effddffa113': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '09d5ac3f-abf0-4687-b17b-5effddffa113',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '3e93d17d-f8c7-4574-9ff3-8774289c8465',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'ff4830e6-b2a4-41ed-85f1-054cb60e08ff',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'b16915ff-d21a-4e08-ba91-2b2b90adbdcd',
  //           },
  //         ],
  //         class: 'stories',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/section',
  //     },
  //     '3e93d17d-f8c7-4574-9ff3-8774289c8465': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '3e93d17d-f8c7-4574-9ff3-8774289c8465',
  //         children: [],
  //         class: 'story 1',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/picture',
  //     },
  //     'ff4830e6-b2a4-41ed-85f1-054cb60e08ff': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'ff4830e6-b2a4-41ed-85f1-054cb60e08ff',
  //         children: [],
  //         class: 'story 2',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/picture',
  //     },
  //     'b16915ff-d21a-4e08-ba91-2b2b90adbdcd': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'b16915ff-d21a-4e08-ba91-2b2b90adbdcd',
  //         children: [],
  //         class: 'story 3',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/picture',
  //     },
  //     '4afae757-3d49-4797-9153-0cb2a57e277b': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '4afae757-3d49-4797-9153-0cb2a57e277b',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'af39eb42-72ed-477b-9a92-896fad872afa',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '21fa4b40-32d1-4caf-af7e-c61a8a1f5e6e',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '1cfb6251-4774-4d07-8d25-2248e15b6b9a',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '106165d1-2cab-4c45-b64f-ebd424646214',
  //           },
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'bdb6aa40-a7a7-42fa-9029-c7872dfc38e6',
  //           },
  //         ],
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/footer',
  //     },
  //     '21fa4b40-32d1-4caf-af7e-c61a8a1f5e6e': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '21fa4b40-32d1-4caf-af7e-c61a8a1f5e6e',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '3f319717-de4f-48b1-a8c5-f057f4445a82',
  //           },
  //         ],
  //         class: 'copyright notice',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/span',
  //     },
  //     '3f319717-de4f-48b1-a8c5-f057f4445a82': '2018 Carona Industries',
  //     '1cfb6251-4774-4d07-8d25-2248e15b6b9a': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '1cfb6251-4774-4d07-8d25-2248e15b6b9a',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: 'c0058168-b360-402c-b3cf-bcd6b3f4b6f4',
  //           },
  //         ],
  //         class: 'impressum',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/span',
  //     },
  //     '106165d1-2cab-4c45-b64f-ebd424646214': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: '106165d1-2cab-4c45-b64f-ebd424646214',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '23df1ef1-ae9d-4f78-8c47-9ae55d81223f',
  //           },
  //         ],
  //         class: '',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/address',
  //     },
  //     'af39eb42-72ed-477b-9a92-896fad872afa': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'af39eb42-72ed-477b-9a92-896fad872afa',
  //         children: [],
  //         class: 'easter',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/a',
  //     },
  //     'bdb6aa40-a7a7-42fa-9029-c7872dfc38e6': {
  //       __descriptorType: 'ComponentInstantiationValueDescriptor',
  //       props: {
  //         key: 'bdb6aa40-a7a7-42fa-9029-c7872dfc38e6',
  //         children: [
  //           {
  //             __descriptorType: 'ReferenceToLocalHiddenValue',
  //             which: '743409aa-cf63-40cd-8839-6b32eedab8aa',
  //           },
  //         ],
  //         class: 'corporate',
  //       },
  //       modifierInstantiationDescriptors: {
  //         byId: {},
  //         list: [],
  //       },
  //       componentId: 'TheaterJS/Core/HTML/span',
  //     },
  //     '23df1ef1-ae9d-4f78-8c47-9ae55d81223f': 'address',
  //     'c0058168-b360-402c-b3cf-bcd6b3f4b6f4': 'impressum',
  //     '743409aa-cf63-40cd-8839-6b32eedab8aa': 'corporate',
  //   },
  //   whatToRender: {
  //     __descriptorType: 'ReferenceToLocalHiddenValue',
  //     which: 'container',
  //   },
  // },
}

export default tempCustomComponentDescriptors
