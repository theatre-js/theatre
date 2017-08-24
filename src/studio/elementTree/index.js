// @flow
import React from 'react'

export const componentConfig = {
  name: {
    value: 'Tree of Elements',
    type: 'text',
  },
}

const ElementTree = (props: $FlowFixMe) => {
  return (
    <div>{props.name.value}</div>
  )
}

export default ElementTree