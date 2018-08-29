import React from 'react'
import css from './SVGWrapper.css'
import {resolveCss} from '$shared/utils'

const classes = resolveCss(css)

interface IProps {
  dopesheet?: boolean
}

export const SVG_PADDING_Y = parseInt(css.svgPaddingY)

class SVGWrapper extends React.PureComponent<IProps, {}> {
  static defaultProps = {
    dopesheet: false,
  }

  render() {
    const {dopesheet} = this.props
    const innerWrapperProps = {
      width: '100%',
      height: dopesheet ? '100%' : `calc(100% - ${SVG_PADDING_Y}px)`,
      x: 0,
      y: dopesheet ? 0 : SVG_PADDING_Y / 2,
    }
    return (
      <svg height="100%" width="100%">
        <svg {...innerWrapperProps} {...classes('innerWrapper')}>
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

export default SVGWrapper
