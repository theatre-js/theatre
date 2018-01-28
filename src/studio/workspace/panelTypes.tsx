// @flow
const panelTypes = {
  elementTree: {
    label: 'Explore',
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
}

export default panelTypes
