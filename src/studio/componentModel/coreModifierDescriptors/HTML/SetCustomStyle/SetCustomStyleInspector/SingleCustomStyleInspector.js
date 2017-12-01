// @flow
import {compose, React, connect, reduceStateAction} from '$studio/handy'
import TextInput from '$studio/common/components/TextInput'
// import map from 'lodash/map'
import get from 'lodash/get'
import KeyValuePair from '$studio/common/components/KeyValuePair'

type Props = {
  pathToPairings: Array<string>,
  pairing: {key: string, value: string},
  dispatch: Function,
  id: string,
}

export class SingleCustomStyleInspector extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  _onKeyChange = (key: string) => {
    this.props.dispatch(
      reduceStateAction(
        [...this.props.pathToPairings, 'byId', this.props.id, 'key'],
        () => key,
      ),
    )
  }

  _onValueChange = (value: string) => {
    this.props.dispatch(
      reduceStateAction(
        [...this.props.pathToPairings, 'byId', this.props.id, 'value'],
        () => value,
      ),
    )
  }

  render() {
    const {pairing} = this.props
    // @todo ux - sort these alphabetically
    return (
      <KeyValuePair
        k={<TextInput key="key" value={pairing.key} onChange={this._onKeyChange} />}
        v={<TextInput key="value" value={pairing.value} onChange={this._onValueChange} />}
      />
    )
  }
}

export default compose(
  connect((s, op: any) => {
    return {
      pairing: get(s, op.pathToPairings).byId[op.id],
    }
  }),
)(SingleCustomStyleInspector)
