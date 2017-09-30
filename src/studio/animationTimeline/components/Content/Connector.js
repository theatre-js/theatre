// @flow
import React from 'react'

type Props = {
  leftPoint: $FlowFixMe,
  rightPoint: $FlowFixMe,
}

const Connector = (props: Props) => {
  const {leftPoint: lp, rightPoint: rp} = props
  return (
    <path
      d={`M ${lp.t} ${lp.value}
          C ${lp.t + lp.handles[2]} ${lp.value + lp.handles[3]}
            ${rp.t + rp.handles[0]} ${rp.value + rp.handles[1]}
            ${rp.t} ${rp.value}`}
      fill='transparent'
      strokeWidth={2}/>
  )
}

export default Connector