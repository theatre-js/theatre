// @flow
import * as React from 'react'
import css from './index.css'

type Props = {
  placeholder: ?string,
  onSubmit: Function,
  onCancel: Function,
}

class SingleInputForm extends React.Component<Props> {
  input: HTMLInputElement

  componentDidMount() {
    this.input.focus()
  }

  handleKeyDown = (e: SyntheticKeyboardEvent<>) => {
    switch (e.keyCode) {
      case 13:
        this.props.onSubmit(this.input.value)
        break
      case 27:
        this.props.onCancel()
        break
    }
  }

  render() {
    return (
      <input
        // $FlowFixMe
        ref={(input) => {this.input = input}}
        placeholder={this.props.placeholder}
        onKeyDown={this.handleKeyDown}
        className={css.input}
        type='text' />
    )
  }
}

export default SingleInputForm