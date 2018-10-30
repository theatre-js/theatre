import {reduceStateAction} from '$shared/utils/redux/commonActions'
import TextInput from '$studio/common/components/TextInput'
import {get} from '$shared/utils'
import KeyValuePair from '$studio/common/components/KeyValuePair'
import {ITheaterStoreState} from '$studio/types'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import React from 'react'
import connect from '$studio/handy/connect'

interface IOwnProps {
  pathToPairings: string[]
  id: string
}

interface Props extends IOwnProps {
  pairing: {key: string; value: string}
}

export class SingleCustomStyleInspector extends PureComponentWithTheater<
  Props,
  {}
> {
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

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  return {
    pairing: get(s, op.pathToPairings).byId[op.id],
  }
})(SingleCustomStyleInspector)
