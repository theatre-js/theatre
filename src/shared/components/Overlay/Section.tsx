import React from 'react'
import {OverlayAPIContext} from '$shared/components/Overlay/Overlay'

interface IProps {
  className?: string
  style?: Object
}

class Section extends React.PureComponent<IProps, {}> {
  render() {
    return (
      <OverlayAPIContext.Consumer>
        {({setRef}) => (
          <div
            className={this.props.className}
            style={this.props.style}
            ref={setRef}
          >
            {this.props.children}
          </div>
        )}
      </OverlayAPIContext.Consumer>
    )
  }
}

export default Section
