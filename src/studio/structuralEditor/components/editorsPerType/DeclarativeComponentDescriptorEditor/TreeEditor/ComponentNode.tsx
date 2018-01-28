// @flow
import {React} from '$studio/handy'
import css from './ComponentNode.css'
import {STATUS} from './constants'
import cx from 'classnames'

type Props = {
  nodeProps: Object
  setAsComponentBeingSet: Function
  setClassValue: Function
}
type State = {
  isContentHidden: boolean
  classValue: string
}

class Node extends React.PureComponent<Props, State> {
  state = {
    classValue: '',
    isContentHidden: false,
  }

  componentDidMount() {
    const classValue = this.props.nodeProps.class
    if (classValue != null) this.setState(() => ({classValue}))
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.nodeProps.status === STATUS.CHANGED &&
      this.state.isContentHidden
    ) {
      this.setState(() => ({isContentHidden: false}))
    }
  }

  setAsComponentBeingSet = () => {
    this.setState(() => ({isContentHidden: true}))
    this.props.setAsComponentBeingSet()
  }

  classValueChangeHandler = e => {
    const {value} = e.target
    this.setState(() => ({classValue: value}))
  }

  keyDownHandler = e => {
    if (e.keyCode === 13) {
      this.input.blur()
    }
  }

  setClassValue = () => {
    if (this.state.classValue !== this.props.nodeProps.class) {
      this.props.setClassValue(this.state.classValue)
    }
  }

  render() {
    const {nodeProps} = this.props
    const {isContentHidden, classValue} = this.state
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
          <input
            ref={c => (this.input = c)}
            type="text"
            placeholder="Class"
            value={classValue}
            onContextMenu={() => this.input.blur()}
            onChange={this.classValueChangeHandler}
            onKeyDown={this.keyDownHandler}
            onBlur={this.setClassValue}
          />
        </div>
      </div>
    )
  }
}

export const presentationOnlyComponent = ({nodeProps}) => {
  return (
    <div className={css.container}>
      <div className={css.displayName}>{`<${nodeProps.displayName}>`}</div>
      <div className={css.class}>
        <input type="text" placeholder="Class" />
      </div>
    </div>
  )
}

export default Node
