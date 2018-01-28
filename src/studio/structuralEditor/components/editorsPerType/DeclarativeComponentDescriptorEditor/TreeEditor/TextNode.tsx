// @flow
import {React} from '$studio/handy'
import css from './TextNode.css'
import cx from 'classnames'
import {STATUS} from './constants'

type Props = {
  nodeProps: Object
  onChange: Function
  setAsComponentBeingSet: Function
}
type State = {
  isFocused: boolean
  isContentHidden: boolean
  previousValue: string
}

class Node extends React.PureComponent<Props, State> {
  state = {
    isFocused: false,
    isContentHidden: false,
    previousValue: this.props.nodeProps.value,
  }

  componentDidMount() {
    if (this.props.nodeProps.status === STATUS.CHANGED) {
      this.input.focus()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.nodeProps.status === STATUS.CHANGED &&
      this.state.isContentHidden
    ) {
      this.setState(() => ({isContentHidden: false}))
      this.input.focus()
    }
  }

  handleKeyDown = e => {
    this.setState(() => ({previousValue: this.input.value}))
    if (e.keyCode === 13 || e.keyCode === 27) this.input.blur()
    
  }

  handleKeyUp = e => {
    if (e.keyCode === 8 && this.props.nodeProps.value === '' && this.state.previousValue === '')
      this.setAsComponentBeingSet()
  }

  setAsComponentBeingSet = () => {
    this.setState(() => ({isContentHidden: true}))
    this.props.setAsComponentBeingSet()
  }

  render() {
    return (
      <div
        className={cx(css.container, {
          [css.isFocused]: this.state.isFocused,
          [css.isContentHidden]: this.state.isContentHidden,
        })}
        onMouseDown={e => {
          if (!e.shiftKey) e.stopPropagation()
        }}
      >
        <div className={css.textLogo}>t</div>
        <input
          ref={c => (this.input = c)}
          type="text"
          className={css.text}
          value={this.props.nodeProps.value}
          onChange={e => this.props.onChange(e.target.value)}
          onFocus={() => this.setState(() => ({isFocused: true}))}
          onBlur={() => this.setState(() => ({isFocused: false}))}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          onContextMenu={() => this.input.blur()}
        />
      </div>
    )
  }
}

export const presentationOnlyComponent = ({nodeProps}) => {
  return (
    <div className={css.container}>
      <div className={css.textLogo}>t</div>
      <input
        type="text"
        className={css.text}
        value={nodeProps.value}
        onChange={() => {}}
      />
    </div>
  )
}

export default Node
