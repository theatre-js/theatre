import propTypes from 'prop-types'
import React from 'react'
import Theater from '$studio/bootstrap/Theater'

export const contextName = '@@theater/stheater'

export const contextTypes = {
  [contextName]: propTypes.any,
}

export class TheaterConsumer extends React.Component<{
  children: (theater: Theater) => React.ReactNode
}> {
  static contextTypes = contextTypes
  render() {
    return this.props.children(this.context[contextName])
  }
}
