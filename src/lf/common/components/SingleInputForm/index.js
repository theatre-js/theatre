// @flow
import * as React from 'react'
import css from './index.css'

type Props = {
  placeholder?: string,
  onSubmit: Function,
  onCancel: Function,
  value?: string,
  customStyle?: boolean,
}

type State = {
  value: string,
}

class SingleInputForm extends React.Component<Props, State> {
  input: $FlowFixMe

  constructor(props: Props) {
    super(props)

    this.state = {
      value: props.value ? props.value : '',
    }
  }

  componentDidMount() {
    this.input.focus()
  }

  handleKeyDown = (e: SyntheticKeyboardEvent<*>) => {
    switch (e.keyCode) {
      case 13:
        this.props.onSubmit(this.input.value)
        break
      case 27:
        this.props.onCancel()
        break
    }
  }

  onChange = (e: SyntheticInputEvent<*>) => {
    const {value} = e.target
    this.setState(() => ({value}))
  }

  render() {
    return (
      <input
        ref={(input) => {this.input = input}}
        placeholder={this.props.placeholder}
        value={this.state.value}
        onKeyDown={this.handleKeyDown}
        {...(!this.props.customStyle ? {className: css.input} : {})}
        onChange={this.onChange}
        type='text' />
    )
  }
}

export default SingleInputForm