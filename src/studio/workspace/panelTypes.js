// @flow
const panelTypes = {
  elementTree: {
    label: 'Elements Tree',
    components: require('$studio/elementTree'),
  },
  elementInspector: {
    label: 'Element Inspector',
    components: require('$studio/elementInspector'),
  },
  animationTimeline: {
    label: 'Animation Timeline',
    components: require('$studio/animationTimeline'),
  },
  compose: {
    label: 'Compose',
    components: require('$studio/composePanel'),
  },
  x1: {
    label: 'X1',
    components: require('$studio/x1'),
  },
}

export default panelTypes
