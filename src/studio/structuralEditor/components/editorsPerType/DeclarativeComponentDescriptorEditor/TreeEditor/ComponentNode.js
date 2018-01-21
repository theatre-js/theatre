// @flow
import {React} from '$studio/handy'
import css from './ComponentNode.css'
import * as constants from './constants'
import cx from 'classnames'

type Props = {
  nodeProps: Object,
  setAsComponentBeingChanged: Function,
}
type State = {
  isContentHidden: boolean,
}

class Node extends React.PureComponent<Props, State> {
  state = {
    isContentHidden: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeProps.status === constants.TYPE_CHANGED && this.state.isContentHidden) {
      this.setState(() => ({isContentHidden: false}))
    }
  }

  setAsComponentBeingChanged = () => {
    this.setState(() => ({isContentHidden: true}))
    this.props.setAsComponentBeingChanged()
  }

  render() {
    const {nodeProps} = this.props
    const {isContentHidden} = this.state
    return (
      <div
        className={cx(css.container, {
          [css.isContentHidden]: isContentHidden || nodeProps.status === constants.CREATED,
        })}
        onMouseDown={e => {
          if (!e.shiftKey) e.stopPropagation()
        }}
      >
        <div className={css.displayName} onClick={this.setAsComponentBeingChanged}>
          {`<${nodeProps.displayName}>`}
        </div>
        <div className={css.class}>
          <input type='text' placeholder='Class' />
        </div>
      </div>
    )
  }
}

export default Node
