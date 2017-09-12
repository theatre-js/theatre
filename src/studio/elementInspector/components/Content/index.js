// @flow
import React from 'react' 

const Content = (props) => {
  const {inputs: {selectedNode}} = props
  return (
    <div>{selectedNode ? selectedNode.data.name : 'no element selected yet'}</div>
  )
}

export default Content