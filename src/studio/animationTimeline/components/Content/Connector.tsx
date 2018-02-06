// @flow
import React from 'react'
import {NormalizedPoint} from '$studio/animationTimeline/types'

type Props = {
  leftPoint: NormalizedPoint
  rightPoint: NormalizedPoint
  removeConnector?: Function
}

type State = {}

class Connector extends React.PureComponent<Props, State> {
  clickHandler = (e: React.MouseEvent<$FixMe>) => {
    if (!this.props.removeConnector) return
    if (e.altKey) {
      return this.props.removeConnector()
    }
  }

  render() {
    const {leftPoint: lp, rightPoint: rp} = this.props
    return (
      <path
        d={`M ${lp.time} ${lp.value}
            C ${lp.time + lp.interpolationDescriptor.handles[2]} ${lp.value +
          lp.interpolationDescriptor.handles[3]}
              ${rp.time + rp.interpolationDescriptor.handles[0]} ${rp.value +
          rp.interpolationDescriptor.handles[1]}
              ${rp.time} ${rp.value}`}
        fill="transparent"
        strokeWidth={2}
        onClick={this.clickHandler}
      />
    )
  }
}

export default Connector
