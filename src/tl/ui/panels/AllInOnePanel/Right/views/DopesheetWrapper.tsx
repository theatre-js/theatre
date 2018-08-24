import React from 'react'

const containerStyle = {
  // height: minBoxHeight;
  height: '100%',
  width: '100%',
}

class DopesheetWrapper extends React.PureComponent<{}, {}> {
  render() {
    return (
      <div style={containerStyle}>
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

export default DopesheetWrapper
