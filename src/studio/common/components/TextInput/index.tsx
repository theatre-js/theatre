import React from 'react'
import css from './index.css'

type Props = {
  value: string
  onChange: (v: string) => void
}

export class TextInput extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  _onChange = (e: $FixMe) => {
    this.props.onChange(e.target.value)
  }

  render() {
    return (
      <div key="container" className={css.container}>
        <input
          type="text"
          key="input"
          className={css.input}
          value={this.props.value}
          onChange={this._onChange}
        />
      </div>
    )
  }
}

export default TextInput
