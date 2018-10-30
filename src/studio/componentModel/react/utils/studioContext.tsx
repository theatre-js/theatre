import propTypes from 'prop-types'
import React from 'react'
import Theatre from '$studio/bootstrap/Theatre'

export const contextName = '@@studio/sstudio'

export const contextTypes = {
  [contextName]: propTypes.any,
}

export class TheatreConsumer extends React.Component<{
  children: (studio: Theatre) => React.ReactNode
}> {
  static contextTypes = contextTypes
  render() {
    return this.props.children(this.context[contextName])
  }
}
