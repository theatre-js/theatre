import {
  compose,
  React,
  connect,
  reduceStateAction,
  StudioComponent,
} from '$studio/handy'
import TextInput from '$studio/common/components/TextInput'
import get from 'lodash/get'
import KeyValuePair from '$studio/common/components/KeyValuePair'
import {IStudioStoreState} from '$studio/types'

interface IOwnProps {
  pathToPairings: Array<string>
  id: string
}

interface IProps extends IOwnProps {
  pairing: {key: string; value: string}
}

export class SingleCustomStyleInspector extends StudioComponent<IProps, {}> {
  _onKeyChange = (key: string) => {
    this.dispatch(
      reduceStateAction(
        [...this.props.pathToPairings, 'byId', this.props.id, 'key'],
        () => key,
      ),
    )
  }

  _onValueChange = (value: string) => {
    this.dispatch(
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
        k={
          <TextInput
            key="key"
            value={pairing.key}
            onChange={this._onKeyChange}
          />
        }
        v={
          <TextInput
            key="value"
            value={pairing.value}
            onChange={this._onValueChange}
          />
        }
      />
    )
  }
}

export default compose(
  connect((s: IStudioStoreState, op: IOwnProps) => {
    return {
      pairing: get(s, op.pathToPairings).byId[op.id],
    }
  }),
)(SingleCustomStyleInspector)
