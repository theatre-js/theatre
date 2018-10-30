import React from 'react'
import css from './GraphsSvgWrapper.css'

export const svgPaddingY = 20

interface IProps {}

interface IState {}

class GraphsSvgWrapper extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <svg height="100%" className={css.outerWrapper}>
        <svg
          x={0}
          y={svgPaddingY / 2}
          height={`calc(100% - ${svgPaddingY}px)`}
          className={css.innerWrapper}
        >
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
      </svg>
    )
  }
}

export default GraphsSvgWrapper
