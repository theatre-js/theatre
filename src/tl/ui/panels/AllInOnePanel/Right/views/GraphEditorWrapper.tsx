import React from 'react'

export const svgPaddingY = 20

const outerWrapperStyle = {
  width: '100%',
}

const innerWrapperStyle = {
  width: '100%',
  overflow: 'visible',
}

class GraphEditorWrapper extends React.PureComponent<{}, {}> {
  render() {
    return (
      <svg height="100%" style={outerWrapperStyle}>
        <svg
          x={0}
          y={svgPaddingY / 2}
          height={`calc(100% - ${svgPaddingY}px)`}
          style={innerWrapperStyle}
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

export default GraphEditorWrapper
