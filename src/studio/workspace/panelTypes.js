// @flow
const panelTypes = {
  elementTree: {
    label: 'Tree of Elements',
    requireFn: () => require('$studio/elementTree').default,
    defaultConfig: {
      name: {
        value: 'Tree of Elements',
        type: 'text',
      },
    },
  },
  elementInspector: {
    label: 'Element Inspector',
    requireFn: () => require('$studio/elementInspector').default,
    defaultConfig: {
      name: {
        value: 'Element Inspector',
        type: 'text',
      },
    },
  },
}

export default panelTypes