// @flow
import {React} from '$studio/handy'
import css from './TextNode.css'
import cx from 'classnames'
import {STATUS} from './constants'

type Props = {
  nodeProps: Object,
  onChange: Function,
  setAsComponentBeingSet: Function,
}
type State = {
  isFocused: boolean,
}

class Node extends React.PureComponent<Props, State> {
  state = {
    isFocused: false,
  }

  componentDidMount() {
    if (this.props.nodeProps.status === STATUS.CHANGED) {
      this.input.focus()
    }
  }

  handleKeyDown = e => {
    if (e.keyCode === 13 || e.keyCode === 27) this.input.blur()
    if (e.keyCode === 8 && this.props.nodeProps.value === '') this.props.setAsComponentBeingSet()
  }

  render() {
    return (
      <div
        className={cx(css.container, {[css.isFocused]: this.state.isFocused})}
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
        />
      </div>
    )
  }
}

export default Node
