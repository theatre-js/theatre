// @flow
const panelTypes = {
  elementTree: {
    label: 'Tree of Elements',
    requireFn: () => require('$studio/elementTree'),
  },
  elementInspector: {
    label: 'Element Inspector',
    requireFn: () => require('$studio/elementInspector'),
  },
  animationTimeline: {
    label: 'Animation Timeline',
    requireFn: () => require('$studio/animationTimeline'),
  },
  x2: {
    label: 'X2',
    requireFn: () => require('$studio/x2'),
  },
}

export default panelTypes
