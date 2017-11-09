// @flow
import {compose, React, connect, reduceStateAction} from '$studio/handy'
import TextInput from '$studio/common/components/TextInput'
// import map from 'lodash/map'
import css from './SingleAttributeInspector.css'
import get from 'lodash/get'

type Props = {
  pathToPairings: Array<string>,
  pairing: {key: string, value: string},
  dispatch: Function,
  id: string,
}

export class SingleAttributeInspector extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  _onKeyChange = (key: string) => {
    this.props.dispatch(
      reduceStateAction([
        {
          path: [...this.props.pathToPairings, 'byId', this.props.id, 'key'],
          reducer: () => key,
        },
      ]),
    )
  }

  _onValueChange = (value: string) => {
    this.props.dispatch(
      reduceStateAction([
        {
          path: [...this.props.pathToPairings, 'byId', this.props.id, 'value'],
          reducer: () => value,
        },
      ]),
    )
  }

  render() {
    const {pairing} = this.props
    // @todo ux - sort these alphabetically
    return (
      <div key="container" className={css.container}>
        <div className={css.keyContainer}>
          <TextInput
            key="key"
            value={pairing.key}
            onChange={this._onKeyChange}
          />
        </div>
        <div className={css.colon}>:</div>
        <div className={css.valueContainer}>
          <TextInput
            key="value"
            value={pairing.value}
            onChange={this._onValueChange}
          />
        </div>
      </div>
    )
  }
}

export default compose(
  connect((s, op: any) => {
    return {
      pairing: get(s, op.pathToPairings).byId[op.id],
    }
  }),
)(SingleAttributeInspector)
