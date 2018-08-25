import React from 'react'
import {OverlayAPIContext} from '$shared/components/Overlay/Overlay'
import noop from '$shared/utils/noop'

interface IProps {
  className?: string
  style?: Object
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

class OverlaySection extends React.PureComponent<IProps, {}> {
  static defaultProps = {
    onClick: noop,
  }

  render() {
    return (
      <OverlayAPIContext.Consumer>
        {({setRef}) => (
          <div
            ref={setRef}
            style={this.props.style}
            onClick={this.props.onClick}
            className={this.props.className}
          >
            {this.props.children}
          </div>
        )}
      </OverlayAPIContext.Consumer>
    )
  }
}

export default OverlaySection
