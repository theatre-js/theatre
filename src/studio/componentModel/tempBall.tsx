import './tempBall.css'

export default {
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
            ballY: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'ballY',
              component: 'Ball',
              property: 'Y',
              extremums: [-1000, 100],
              points: [
                {
                  __descriptorType: 'TimelineVarPoint',
                  id: '2',
                  time: 0,
                  value: 0,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, .5, 0],
                    connected: true,
                  },
                },
              ],
            },
            ballScaleY: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'ballScaleY',
              component: 'Ball',
              property: 'ScaleY',
              extremums: [-0.5, 1.5],
              points: [
                {
                  __descriptorType: 'TimelineVarPoint',
                  id: '2',
                  time: 0,
                  value: 1,
                  interpolationDescriptor: {
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, .5, 0],
                    connected: true,
                  },
                },
              ],
            },
            // theOpacity: {
            //   __descriptorType: 'TimelineVarDescriptor',
            //   id: 'theOpacity',
            //   component: 'button',
            //   property: 'bottom',
            //   extremums: [-100, 1400],
            //   backPointer: {
            //     type: 'PointerThroughLocalHiddenValue',
            //     localHiddenValueId: 'container',
            //     rest: [
            //       'modifierInstantiationDescriptors',
            //       'byId',
            //       '1',
            //       'props',
            //       'pairings',
            //       'byId',
            //       '3',
            //       'value',
            //     ],
            //   },
            //   points: [
            //     {
            //       __descriptorType: 'TimelineVarPoint',
            //       id: '1',
            //       time: 300,
            //       value: 1000,
            //       interpolationDescriptor: {
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.5, 0, 0, 1],
            //         connected: true,
            //       },
            //     },
            //   ],
            // },
          },
          layout: ['box1', 'box2'],
          boxes: {
            box1: {
              id: 'box1',
              height: 300,
              variables: ['ballY'],
            },
            box2: {
              id: 'box2',
              height: 100,
              variables: ['ballScaleY'],
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
          children: [
            {
              __descriptorType: 'ReferenceToLocalHiddenValue',
              which: '8f69e8f5-77c3-4b9c-9864-e14c004f7e89',
            },
          ],
        },
        modifierInstantiationDescriptors: {
          byId: {
            '1': {
              __descriptorType: 'ModifierInstantiationValueDescriptor',
              modifierId: 'TheaterJS/Core/HTML/UberModifier',
              props: {
                translationX: '0',
                translationY: '0',
                translationZ: '0',
                opacity: '1',
                scaleX: '1',
                scaleY: '1',
                scaleZ: '1',
                rotateX: '0',
                rotateY: '0',
                rotateZ: '0',
              },
              enabled: true,
            },
          },
          list: ['1'],
        },
      },
      '8f69e8f5-77c3-4b9c-9864-e14c004f7e89': {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        props: {
          key: '8f69e8f5-77c3-4b9c-9864-e14c004f7e89',
          children: [
            {
              __descriptorType: 'ReferenceToLocalHiddenValue',
              which: '571bb924-7a12-4c8a-aa30-b256b118ae20',
            },
          ],
          class: 'scene',
        },
        modifierInstantiationDescriptors: {
          byId: {
            '2': {
              __descriptorType: 'ModifierInstantiationValueDescriptor',
              modifierId: 'TheaterJS/Core/HTML/UberModifier',
              props: {
                translationX: '0',
                translationY: '0',
                opacity: '1',
                translationZ: '0',
                scaleX: '1',
                scaleY: '1',
                scaleZ: '1',
                rotateX: '0',
                rotateY: '0',
                rotateZ: '0',
              },
              enabled: true,
            },
          },
          list: ['2'],
        },
        componentId: 'TheaterJS/Core/HTML/div',
      },
      '571bb924-7a12-4c8a-aa30-b256b118ae20': {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        props: {
          key: '571bb924-7a12-4c8a-aa30-b256b118ae20',
          children: [],
          class: 'ball',
        },
        modifierInstantiationDescriptors: {
          byId: {
            '1': {
              __descriptorType: 'ModifierInstantiationValueDescriptor',
              modifierId: 'TheaterJS/Core/HTML/UberModifier',
              props: {
                translationX: '0',
                translationY: {
                  __descriptorType: 'ReferenceToTimelineVar',
                  timelineId: 'timeline1',
                  varId: 'ballY', 
                },
                translationZ: '0',
                opacity: '1',
                scaleX: '1',
                scaleY: {
                  __descriptorType: 'ReferenceToTimelineVar',
                  timelineId: 'timeline1',
                  varId: 'ballScaleY', 
                },
                scaleZ: '1',
                rotateX: '0',
                rotateY: '0',
                rotateZ: '0',
              },
              enabled: true,
            },
          },
          list: ['1'],
        },
        componentId: 'TheaterJS/Core/HTML/div',
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
}
