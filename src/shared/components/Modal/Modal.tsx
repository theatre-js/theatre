import React from 'react'
import css from './Modal.css'
import resolveCss from '$shared/utils/resolveCss'
import ReactDOM from 'react-dom'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'

const classes = resolveCss(css)

interface IProps {
  onClose: () => void
}

interface IState {}

class Modal extends React.PureComponent<IProps, IState> {
  render() {
    return ReactDOM.createPortal(this._renderModal(), document.body)
  }

  _renderModal() {
    return (
      <div {...classes('fixedLayer')}>
        <Overlay onClickOutside={this.props.onClose} propagateWheel>
          <OverlaySection {...classes('container')}>
            {this.props.children}
          </OverlaySection>
        </Overlay>
      </div>
    )
  }
}

export default Modal
