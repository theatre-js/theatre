import React from 'react'
import css from './Modal.css'
import resolveCss from '$shared/utils/resolveCss'
import ReactDOM from 'react-dom'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'

const classes = resolveCss(css)

interface IProps {
  onClose: () => void
  autoClose?: boolean
  container?: HTMLElement
}

interface IState {
  closed: boolean
}

class Modal extends React.PureComponent<IProps, IState> {
  fixedLayer: React.RefObject<HTMLDivElement> = React.createRef()

  state = {
    closed: false,
  }

  render() {
    return ReactDOM.createPortal(this._renderModal(), this.props.container || document.body)
  }

  _renderModal() {
    return (
      <div ref={this.fixedLayer} {...classes('fixedLayer')}>
        <Overlay onClickOutside={this.close} propagateWheel>
          <OverlaySection {...classes('container')}>
            {this.props.children}
          </OverlaySection>
        </Overlay>
      </div>
    )
  }

  // componentDidMount() {
  //   this.fixedLayer.current!.addEventListener(
  //     'animationend',
  //     this.handleAnimationEnd,
  //   )
  // }

  // componentWillUnmount() {
  //   this.fixedLayer.current!.removeEventListener(
  //     'animationend',
  //     this.handleAnimationEnd,
  //   )
  // }

  // handleAnimationEnd = (event: AnimationEvent) => {
  //   if (event.animationName === css.disappear) {
  //     this.props.onClose()
  //   }
  // }

  close = () => {
    this.props.onClose()
    // if (this.props.autoClose === false) {
    //   this.props.onClose()
    // } else {
    //   this.setState(() => ({closed: true}))
    // }
  }
}

export default Modal
