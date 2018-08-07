import React from 'react'
import css from './DopeSheetWrapper.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {}

interface IState {}

class DopeSheetWrapper extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <div {...classes('container')}>
        <svg width="100%" height="100%">
          <defs>
            <filter id="glow">
              <feColorMatrix
                type="matrix"
                values={` 3  0  0  0  0
                          0  3  0  0  0
                          0  0  3  0  0
                          0  0  0  1  0`}
              />
              <feGaussianBlur stdDeviation=".7" />
            </filter>
          </defs>
          {this.props.children}
        </svg>
      </div>
    )
  }
}

export default DopeSheetWrapper
