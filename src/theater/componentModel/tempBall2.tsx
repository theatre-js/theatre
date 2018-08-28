import './tempBall.css'

const two = {
  BouncyBall: {
    __descriptorType: 'DeclarativeComponentDescriptor',
    id: 'BouncyBall',
    displayName: 'BouncyBall',
    listOfRulesets: [],
    ruleSetsById: {},
    timelineDescriptors: {
      byId: {
        defaultTimeline: {
          __descriptorType: 'TimelineDescriptor',
          id: 'defaultTimeline',
          variables: {
            translationY: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'translationY',
              component: 'div.ball',
              property: 'translationY',
              points: [
                {
                  time: 950,
                  value: 20,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                {
                  time: 1550,
                  value: 0,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                {
                  time: 3190,
                  value: -100,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                {
                  time: 6190,
                  value: 100,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                ...Array.from(new Array(21).keys()).map(i => ({
                  time: 6500 + 650 * i,
                  value: Math.random() * 200 - 100,
                  interpolationDescriptor: {
                    connected: i < 20,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                })),
              ],
            },
            opacity: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'opacity',
              component: 'div.ball',
              property: 'opacity',
              points: [
                {
                  time: 1550,
                  value: 0,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                {
                  time: 4190,
                  value: 1,
                  interpolationDescriptor: {
                    connected: false,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
              ],
            },
            translationYZ: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'translationYZ',
              component: 'div.ball',
              property: 'translationYZ',
              points: [
                ...Array.from(new Array(21).keys()).map(i => ({
                  time: i * 1000,
                  value: Math.random() * 100,
                  interpolationDescriptor: {
                    connected: i < 20,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                })),
              ],
            },
            translationYZZ: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'translationYZZ',
              component: 'div.ball',
              property: 'translationYZZ',
              points: [
                {
                  time: 1550,
                  value: 0,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                {
                  time: 4190,
                  value: -100,
                  interpolationDescriptor: {
                    connected: false,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
              ],
            },
            translationYZT: {
              __descriptorType: 'TimelineVarDescriptor',
              id: 'translationYZT',
              component: 'div.ball',
              property: 'translationYZT',
              points: [
                {
                  time: 1550,
                  value: 0,
                  interpolationDescriptor: {
                    connected: true,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
                {
                  time: 4190,
                  value: -100,
                  interpolationDescriptor: {
                    connected: false,
                    __descriptorType: 'TimelinePointInterpolationDescriptor',
                    interpolationType: 'CubicBezier',
                    handles: [0.5, 0, 0.5, 0],
                  },
                },
              ],
            },
          },
          layout: [
            'box-translateY',
            'box-translateYP',
            'box-translateYZ',
            'box-translateYZZ',
            'box-translateYZT',
          ],
          // layout: ['box-translateYZ', 'box-translateY', 'box-translateYP'],
          // layout: ['box-translateY', 'box-translateYP'],
          boxes: {
            'box-translateY': {
              id: 'box-translateY',
              height: 226,
              variables: ['translationY'],
              activeVariable: 'translationY',
              dopeSheet: false,
            },
            'box-translateYP': {
              id: 'box-translateYP',
              height: 126,
              variables: ['opacity'],
              activeVariable: 'opacity',
              dopeSheet: false,
            },
            'box-translateYZ': {
              id: 'box-translateYZ',
              height: 126,
              variables: ['translationYZ'],
              activeVariable: 'translationYZ',
              dopeSheet: false,
            },
            'box-translateYZZ': {
              id: 'box-translateYZZ',
              height: 126,
              variables: ['translationYZZ'],
              activeVariable: 'translationYZZ',
              dopeSheet: false,
            },
            'box-translateYZT': {
              id: 'box-translateYZT',
              height: 126,
              variables: ['translationYZT'],
              activeVariable: 'translationYZT',
              dopeSheet: false,
            },
          },
        },
      },
      list: ['defaultTimeline'],
    },
    localHiddenValuesById: {
      ball: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        props: {
          key: 'ball',
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
                  timelineId: 'defaultTimeline',
                  varId: 'translationY',
                },
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
          // list: ['1', '2', '3', '4', '5', '6', '7'],
          list: ['1'],
        },
        componentId: 'TheaterJS/Core/HTML/div',
      },
    },
    whatToRender: {
      __descriptorType: 'ReferenceToLocalHiddenValue',
      which: 'ball',
    },
    meta: {
      composePanel: {
        selectedNodeId: 'ball',
      },
    },
  },
  EmptyScene: {
    isScene: true,
    __descriptorType: 'DeclarativeComponentDescriptor',
    displayName: 'EmptyScene',
    id: 'EmptyScene',
    timelineDescriptors: {
      list: [],
      byId: {},
    },
    type: 'Declarative',
    localHiddenValuesById: {
      nothing: null,
    },
    whatToRender: {
      __descriptorType: 'ReferenceToLocalHiddenValue',
      which: 'nothing',
    },
  },
  IntroScene: {
    isScene: true,
    __descriptorType: 'DeclarativeComponentDescriptor',
    id: 'IntroScene',
    displayName: 'IntroScene',
    listOfRulesets: [],
    ruleSetsById: {},
    timelineDescriptors: {
      byId: {
        defaultTimeline: {
          __descriptorType: 'TimelineDescriptor',
          id: 'defaultTimeline',
          variables: {},
          layout: [],
          boxes: {},
        },
      },
      list: ['defaultTimeline'],
    },
    localHiddenValuesById: {
      hallo: 'hallo',
      fontSize: '18px',
      container: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        componentId: 'TheaterJS/Core/HTML/div',
        props: {
          class: 'scene',
          key: 'container',
          children: [
            // {
            //   __descriptorType: 'ReferenceToLocalHiddenValue',
            //   which: 'hallo',
            // },
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
      balli: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        componentId: 'BouncyBall',
        props: {
          key: 'balli',
        },
        modifierInstantiationDescriptors: {
          list: [],
          byId: {},
        },
      },
      '8f69e8f5-77c3-4b9c-9864-e14c004f7e89': {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        props: {
          key: '8f69e8f5-77c3-4b9c-9864-e14c004f7e89',
          children: [
            {
              __descriptorType: 'ReferenceToLocalHiddenValue',
              which: 'balli',
            },
          ],
          class: 'phone',
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
    },
    whatToRender: {
      __descriptorType: 'ReferenceToLocalHiddenValue',
      which: 'container',
    },
    meta: {
      composePanel: {
        selectedNodeId: '449bfb46-489c-46be-b559-2807c09d4276',
      },
    },
  },
}

export default two /* {
  BouncyBall: {
    __descriptorType: 'DeclarativeComponentDescriptor',
    id: 'BouncyBall',
    displayName: 'BouncyBall',
    listOfRulesets: [],
    ruleSetsById: {},
    timelineDescriptors: {
      byId: {
        defaultTimeline: {
          __descriptorType: 'TimelineDescriptor',
          id: 'defaultTimeline',
          variables: {
            // ballY: {
            //   __descriptorType: 'TimelineVarDescriptor',
            //   id: 'ballY',
            //   component: 'Ball',
            //   property: 'Y',
            //   extremums: [-200, 0],
            //   points: [
            //     {
            //       time: 0,
            //       value: -200,
            //       interpolationDescriptor: {
            //         connected: false,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.5, 0, 0.5, 0],
            //       },
            //     },
            //     {
            //       __descriptorType: 'TimelineVarPoint',
            //       id: '0',
            //       time: 908.7950747581355,
            //       value: -200,
            //       interpolationDescriptor: {
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [
            //           0.5162047189250096,
            //           0.03487076010767417,
            //           0.012745775791821595,
            //           0.65511650754909,
            //         ],
            //         connected: true,
            //       },
            //     },
            //     {
            //       __descriptorType: 'TimelineVarPoint',
            //       id: '2',
            //       time: 1530,
            //       value: 0,
            //       interpolationDescriptor: {
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.4, 0, 0.2758509493312434, 0.3678929765886288],
            //         connected: true,
            //       },
            //     },
            //     {
            //       time: 2110,
            //       value: 0,
            //       interpolationDescriptor: {
            //         connected: true,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.5, 0, 0.5, 0],
            //       },
            //     },
            //     {
            //       time: 2516.7464114832537,
            //       value: -196.72131147540983,
            //       interpolationDescriptor: {
            //         connected: false,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.5, 0, 0.5, 0],
            //       },
            //     },
            //   ],
            // },
            // ballScaleY: {
            //   __descriptorType: 'TimelineVarDescriptor',
            //   id: 'ballScaleY',
            //   component: 'Ball',
            //   property: 'ScaleY',
            //   extremums: [0.4085714285714286, 1.2],
            //   points: [
            //     {
            //       time: 0,
            //       value: 1,
            //       interpolationDescriptor: {
            //         connected: false,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.5, 0, 0.5, 0],
            //       },
            //     },
            //     {
            //       time: 1530,
            //       value: 1,
            //       interpolationDescriptor: {
            //         connected: true,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.18102073365231264, 0.7428571428571429, 0.5, 0],
            //       },
            //     },
            //     {
            //       time: 1867.751196172249,
            //       value: 0.4085714285714286,
            //       interpolationDescriptor: {
            //         connected: true,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [
            //           0.41330106206198974,
            //           0.6714285714285715,
            //           0.543349468969005,
            //           0.17142857142857149,
            //         ],
            //       },
            //     },
            //     {
            //       time: 2530,
            //       value: 1.2,
            //       interpolationDescriptor: {
            //         connected: false,
            //         __descriptorType: 'TimelinePointInterpolationDescriptor',
            //         interpolationType: 'CubicBezier',
            //         handles: [0.5, 0, 0.5, 0],
            //       },
            //     },
            //   ],
            // },
          },
          layout: [],
          // layout: ['box1', 'box2'],
          boxes: {
            // box1: {
            //   id: 'box1',
            //   height: 91,
            //   variables: ['ballY'],
            // },
            // box2: {
            //   id: 'box2',
            //   height: 100,
            //   variables: ['ballScaleY'],
            // },
          },
        },
      },
      list: ['defaultTimeline'],
    },
    localHiddenValuesById: {
      ball: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        props: {
          key: 'ball',
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
                translationY: '0',
                // translationY: {
                //   __descriptorType: 'ReferenceToTimelineVar',
                //   timelineId: 'defaultTimeline',
                //   varId: 'ballY',
                // },
                translationZ: '0',
                opacity: '1',
                scaleX: '1',
                scaleY: '1',
                // scaleY: {
                //   __descriptorType: 'ReferenceToTimelineVar',
                //   timelineId: 'defaultTimeline',
                //   varId: 'ballScaleY',
                // },
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
      which: 'ball',
    },
    meta: {
      composePanel: {
        selectedNodeId: 'ball',
      },
    },
  },
  IntroScene: {
    __descriptorType: 'DeclarativeComponentDescriptor',
    id: 'IntroScene',
    displayName: 'IntroScene',
    listOfRulesets: [],
    ruleSetsById: {},
    timelineDescriptors: {
      byId: {
        defaultTimeline: {
          __descriptorType: 'TimelineDescriptor',
          id: 'defaultTimeline',
          variables: {},
          layout: [],
          boxes: {},
        },
      },
      list: ['defaultTimeline'],
    },
    localHiddenValuesById: {
      fontSize: '18px',
      container: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        componentId: 'TheaterJS/Core/HTML/div',
        props: {
          class: 'scene',
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
      balli: {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        componentId: 'BouncyBall',
        props: {
          key: 'balli',
        },
        modifierInstantiationDescriptors: {
          list: [],
          byId: {},
        },
      },
      '8f69e8f5-77c3-4b9c-9864-e14c004f7e89': {
        __descriptorType: 'ComponentInstantiationValueDescriptor',
        props: {
          key: '8f69e8f5-77c3-4b9c-9864-e14c004f7e89',
          children: [
            {
              __descriptorType: 'ReferenceToLocalHiddenValue',
              which: 'balli',
            },
          ],
          class: 'phone',
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
    },
    whatToRender: {
      __descriptorType: 'ReferenceToLocalHiddenValue',
      which: 'container',
    },
    meta: {
      composePanel: {
        selectedNodeId: '571bb924-7a12-4c8a-aa30-b256b118ae20',
      },
    },
  },
}
*/
