// @flow
import React from 'react' 

export const componentConfig = {
  name: {
    value: 'Element Inspector',
    type: 'text',
  },
}

const ElementInspector = (props: $FlowFixMe) => {
  return (
    <div>{props.name.value}</div>
  )
}

export default ElementInspector