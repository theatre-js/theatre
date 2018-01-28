// @flow
import {compose, React} from '$studio/handy'
import css from './index.css'

type Props = {
  value: string
  onChange: ({k: string, v: string}) => boolean
  validationError: undefined | null | string
}

export class TextInput extends React.PureComponent<Props, void> {
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

export default compose(a => a)(TextInput)
