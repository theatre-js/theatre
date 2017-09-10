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
}

export default panelTypes