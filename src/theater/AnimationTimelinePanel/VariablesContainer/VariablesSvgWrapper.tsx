import React from 'react'
import css from './VariablesSvgWrapper.css'

export const svgPaddingY = 20

interface IProps {}

interface IState {}

class VariablesSvgWrapper extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <svg height="100%" className={css.outerWrapper}>
        <svg
          x={0}
          y={svgPaddingY / 2}
          height={`calc(100% - ${svgPaddingY}px)`}
          className={css.innerWrapper}
        >
          {this.props.children}
        </svg>
      </svg>
    )
  }
}

export default VariablesSvgWrapper
