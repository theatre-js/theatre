import resolveCss from '$shared/utils/resolveCss'
import React from 'react'
import * as css from './WithTooltip.css'
import cloneElementAndMergeCallbacks from '$shared/utils/react/cloneElementAndMergeCallbacks'
import ReactDOM from 'react-dom'

const heightThreshold = 80

interface IProps {
  css?: Partial<typeof css>
  children: React.DOMElement<$IntentionalAny, $IntentionalAny>
  inside: React.ReactNode
}

interface IState {
  mouseInChild: boolean
  boundingRect: {
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number
  }
  windowDims: {width: number; height: number}
}

export default class WithTooltip extends React.Component<IProps, IState> {
  childRef = React.createRef<HTMLElement>()
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      mouseInChild: false,
      boundingRect: null as $IntentionalAny,
      windowDims: null as $IntentionalAny,
    }
  }

  render() {
    const classes = resolveCss(css, this.props.css)
    const child = cloneElementAndMergeCallbacks(this.props.children, {
      ref: this.childRef,
      onMouseEnter: this._onMouseEnter,
      onMouseLeave: this._onMouseLeave,
    })

    let tip: React.ReactNode = null
    if (this.state.mouseInChild) {
      const {boundingRect, windowDims} = this.state
      const subjectBottom = windowDims.height - boundingRect.bottom

      const showBelow = subjectBottom > heightThreshold

      tip = ReactDOM.createPortal(
        <div
          {...classes('tipContainer', showBelow && 'below')}
          style={{
            // left: '5px'
            left: `${boundingRect.left + boundingRect.width / 2}px`,
            ...(showBelow
              ? {top: `${boundingRect.bottom}px`}
              : {bottom: `${windowDims.height - boundingRect.bottom}px`}),
          }}
        >
          <div {...classes('tipContent')}>{this.props.inside}</div>
        </div>,
        document.body,
      )
    }

    return (
      <>
        {tip}
        {child}
      </>
    )
  }

  _onMouseEnter = () => {
    const child = this.childRef.current!
    const r = child.getBoundingClientRect()
    const boundingRect = {
      width: r.width,
      height: r.height,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      left: r.left,
    }
    const windowDims = {width: window.innerWidth, height: window.innerHeight}

    this.setState({mouseInChild: true, boundingRect, windowDims})
  }

  _onMouseLeave = () => {
    // return
    this.setState({mouseInChild: false})
  }
}
