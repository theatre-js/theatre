import React from 'react'
import * as css from './TextNode.css'
import cx from 'classnames'
import {STATUS} from './constants'
import {debounce} from 'lodash'

type Props = {
  nodeProps: {value: $FixMe; status: $FixMe}
  onChange: Function
  handleTypeChange: () => void
}
type State = {
  isFocused: boolean
  isContentHidden: boolean
  previousValue: string
  value: string
}

class TextNode extends React.PureComponent<Props, State> {
  input: HTMLInputElement
  constructor(props: Props) {
    super(props)

    this.state = {
      isFocused: false,
      isContentHidden: false,
      previousValue: props.nodeProps.value,
      value: props.nodeProps.value,
    }

    this.updateText = debounce(this.updateText, 10, {trailing: true})
  }

  componentDidMount() {
    if (this.props.nodeProps.status === STATUS.CHANGED) {
      this.input.focus()
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      (nextProps.nodeProps.status === STATUS.CHANGED ||
        nextProps.nodeProps.status === STATUS.UNCHANGED) &&
      this.state.isContentHidden
    ) {
      this.setState(() => ({isContentHidden: false}))
      this.input.focus()
    }
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    this.setState(() => ({previousValue: this.input.value}))
    if (e.keyCode === 13 || e.keyCode === 27) this.input.blur()
  }

  handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.keyCode === 8 &&
      this.props.nodeProps.value === '' &&
      this.state.previousValue === ''
    ) {
      this.props.handleTypeChange()
    }
  }

  handleChange = (e: $FixMe) => {
    const {value} = e.target
    this.setState(() => ({value}))
    this.updateText(value)
  }

  updateText(value: string) {
    this.props.onChange(value)
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
          ref={c => (this.input = c as $IntentionalAny)}
          type="text"
          className={css.text}
          value={this.state.value}
          onChange={this.handleChange}
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

export default TextNode
