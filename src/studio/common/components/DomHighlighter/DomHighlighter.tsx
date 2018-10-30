import React from 'react'
import ReactDOM from 'react-dom'
import css from './DomHighlighter.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  domEl: HTMLElement
  children: (showOverlay: () => any, hideOverlay: () => any) => any
}

interface IState {
  isVisible: boolean
}

class DomHighlighter extends React.PureComponent<IProps, IState> {
  overlay: HTMLDivElement | null
  state = {
    isVisible: false,
  }

  showOverlay = () => {
    this.setState(() => ({isVisible: true}))
  }

  hideOverlay = () => {
    this.setState(() => ({isVisible: false}))
  }

  private getStyle() {
    const {domEl} = this.props
    const {left, top, right, bottom} = domEl.getBoundingClientRect()
    // const computedStyles = getComputedStyle(domEl)

    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
    }
  }

  updateOverlayStyle = () => {
    if (this.overlay != null) {
      const {left, top, width, height} = this.getStyle()
      this.overlay.style.left = `${left}px`
      this.overlay.style.top = `${top}px`
      this.overlay.style.width = `${width}px`
      this.overlay.style.height = `${height}px`
      this.overlay.style.setProperty('--left', `${left}px`)
      this.overlay.style.setProperty('--top', `${top}px`)
    }
    if (this.state.isVisible) requestAnimationFrame(this.updateOverlayStyle)
  }

  renderOverlay() {
    this.updateOverlayStyle()
    const style = this.getStyle()
    return ReactDOM.createPortal(
      <div
        ref={c => (this.overlay = c)}
        {...classes('container')}
        style={{
          ...style,
          '--left': `${style.left}px`,
          '--top': `${style.top}px`,
        }}
      />,
      document.getElementById('theaterjs-studio') as HTMLElement,
    )
  }

  render() {
    return (
      <>
        {this.props.children(this.showOverlay, this.hideOverlay)}
        {this.state.isVisible && this.renderOverlay()}
      </>
    )
  }
}

export default DomHighlighter
