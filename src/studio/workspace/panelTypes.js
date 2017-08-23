// @flow
const panelTypes = {
  elementTree: {
    label: 'Tree of Elements',
    requireFn: () => require('$studio/elementTree').default,
  },
  elementInspector: {
    label: 'Element Inspector',
    requireFn: () => require('$studio/elementInspector').default,
  },
}

export default panelTypes