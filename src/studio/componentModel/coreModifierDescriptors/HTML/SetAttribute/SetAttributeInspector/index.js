// @flow
import {compose, React, connect} from '$studio/handy'
import map from 'lodash/map'
import get from 'lodash/get'
import SingleAttributeInspector from './SingleAttributeInspector'

type Props = {
  list: $FixMe,
  pathToModifierInstantiationDescriptor: Array<string>,
}

export class SetAttributeInspector extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  onChange = (kv: {key: string, value: string}, k: string) => {
    console.log('change', kv, k)
  }

  render() {
    const {list} = this.props
    // @todo ux - sort these alphabetically
    return map(list, (id, index) => {
      return <SingleAttributeInspector key={id} id={id} index={index} pathToPairings={[...this.props.pathToModifierInstantiationDescriptor, 'props', 'pairings']}  />
    })
  }


}

export default compose(
  connect((s, op: any) => {
    return {
      list: get(s, op.pathToModifierInstantiationDescriptor).props.pairings.list,
    }
  }),
)(SetAttributeInspector)