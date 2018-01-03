// @flow
import {React} from '$studio/handy'
import css from './MouseDetector.css'

class MouseDetector extends React.PureComponent<any, void> {
  render() {
    return (
      <div onMouseOver={this.props.mouseOverCallback} onMouseLeave={this.props.mouseLeaveCallback} className={css.container} />
    )
  }
}

export default MouseDetector
