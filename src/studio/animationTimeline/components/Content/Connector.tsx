// @flow
import React from 'react'
import {NormalizedPoint} from '$studio/animationTimeline/types'

type Props = {
  leftPoint: NormalizedPoint,
  rightPoint: NormalizedPoint,
  removeConnector?: Function,
}

type State = {}

class Connector extends React.Component<Props, State> {
  clickHandler = (e: SyntheticMouseEvent<>) => {
    if (!this.props.removeConnector) return
    if (e.altKey) {
      return this.props.removeConnector()
    }
  }

  render() {
    const {leftPoint: lp, rightPoint: rp} = this.props
    return (
      <path
        d={`M ${lp.t} ${lp.value}
            C ${lp.t + lp.handles[2]} ${lp.value + lp.handles[3]}
              ${rp.t + rp.handles[0]} ${rp.value + rp.handles[1]}
              ${rp.t} ${rp.value}`}
        fill="transparent"
        strokeWidth={2}
        onClick={this.clickHandler}
      />
    )
  }
}

export default Connector
