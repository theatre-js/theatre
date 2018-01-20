// @flow
import {React} from '$studio/handy'
import css from './ComponentNode.css'
import {CREATED, TYPE_CHANGED} from './'
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
    if (nextProps.nodeProps.status === TYPE_CHANGED && this.state.isContentHidden) {
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
          [css.isContentHidden]: isContentHidden || nodeProps.status === CREATED,
        })}
        onMouseDown={e => {
          if (!e.shiftKey) e.stopPropagation()
        }}
      >
        <div className={css.displayName} onClick={this.setAsComponentBeingChanged}>
          {`<${nodeProps.displayName}>`}
        </div>
      </div>
    )
  }
}

export default Node
