// @flow
import React from 'react'

export const componentConfig = {
  name: {
    value: 'Tree of Elements',
    type: 'text',
  },
}

const getReactDomComponent = (dom: ?Object) => {
  if (dom != null) {
    const componentKey = Object.keys(dom).find((key) => key.startsWith('__reactInternalInstance$'))
    const internalInstance = dom[componentKey]
    if (!internalInstance) return null
    return internalInstance
  } else {
    return null
  }
}

const ElementTree = (props: $FlowFixMe) => {
  const dom = document.getElementById('theater-root')
  const root = getReactDomComponent(dom)
  console.log(root)
  return (
    <div>{props.name.value}</div>
  )
}

export default ElementTree