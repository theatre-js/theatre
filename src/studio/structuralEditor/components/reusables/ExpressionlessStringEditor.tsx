// @flow
import {React, compose, connect, reduceStateAction} from '$studio/handy'
import css from './ExpressionlessStringEditor.css'
import * as _ from 'lodash'

type Props = {
  label: string
  path: Array<string>
  dispatch: Function
}

type State = void

class ExpressionlessStringEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  onChange = e => {
    const {value} = e.target
    this.props.dispatch(reduceStateAction(this.props.path, () => value))
  }

  render() {
    const {props} = this

    return (
      <div className={css.container}>
        <label className={css.label}>{props.label}</label>
        <input
          className={css.input}
          type="text"
          value={typeof props.value === 'string' ? props.value : ''}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

export default compose(
  connect((s, op) => {
    return {
      value: _.get(s, op.path),
    }
  }),
)(ExpressionlessStringEditor)
