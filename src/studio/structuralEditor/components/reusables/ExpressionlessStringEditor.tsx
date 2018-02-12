import {React, connect, reduceStateAction, StudioComponent} from '$studio/handy'
import css from './ExpressionlessStringEditor.css'
import * as _ from 'lodash'
import {IStoreState} from '$studio/types'

interface IOwnProps {
  label: string
  path: Array<string>
}

interface IProps extends IOwnProps {
  value: $FixMe
}

interface State {}

class ExpressionlessStringEditor extends StudioComponent<IProps, State> {
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    this.dispatch(reduceStateAction(this.props.path, () => value))
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

export default connect((s: IStoreState, op: IOwnProps): {value: string} => {
  return {
    value: _.get(s, op.path),
  }
})(ExpressionlessStringEditor)
