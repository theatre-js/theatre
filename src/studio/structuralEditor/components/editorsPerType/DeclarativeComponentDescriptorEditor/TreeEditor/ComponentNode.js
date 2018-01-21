// @flow
import {React} from '$studio/handy'
import css from './ComponentNode.css'
import {STATUS} from './constants'
import cx from 'classnames'

type Props = {
  nodeProps: Object,
  setAsComponentBeingSet: Function,
}
type State = {
  isContentHidden: boolean,
}

class Node extends React.PureComponent<Props, State> {
  state = {
    isContentHidden: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeProps.status === STATUS.CHANGED && this.state.isContentHidden) {
      this.setState(() => ({isContentHidden: false}))
    }
  }

  setAsComponentBeingSet = () => {
    this.setState(() => ({isContentHidden: true}))
    this.props.setAsComponentBeingSet()
  }

  render() {
    const {nodeProps} = this.props
    const {isContentHidden} = this.state
    return (
      <div
        className={cx(css.container, {
          [css.isContentHidden]: isContentHidden,
        })}
        onMouseDown={e => {
          if (!e.shiftKey) e.stopPropagation()
        }}
      >
        <div className={css.displayName} onClick={this.setAsComponentBeingSet}>
          {`<${nodeProps.displayName}>`}
        </div>
        <div className={css.class}>
          <input type="text" placeholder="Class" />
        </div>
      </div>
    )
  }
}

export const presentationOnlyComponent = ({nodeProps}) => {
  return (
    <div className={css.container}>
      <div className={css.displayName}>
        {`<${nodeProps.displayName}>`}
      </div>
      <div className={css.class}>
        <input type="text" placeholder="Class" />
      </div>
    </div>
  )
}

export default Node
