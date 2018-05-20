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
          variables: {},
          layout: [],
          boxes: {},
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
          class: 'container',
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

export default two