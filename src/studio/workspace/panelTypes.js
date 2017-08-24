// @flow
const panelTypes = {
  elementTree: {
    label: 'Tree of Elements',
    requireFn: () => require('$studio/elementTree').default,
    defaultConfig: require('$studio/elementTree').componentConfig,
  },
  elementInspector: {
    label: 'Element Inspector',
    requireFn: () => require('$studio/elementInspector').default,
    defaultConfig: require('$studio/elementInspector').componentConfig,
  },
}

export default panelTypes