import {compose, React, connect} from '$studio/handy'
import {map, get} from 'lodash'
import SingleAttributeInspector from './SingleAttributeInspector'
import ModifierInspectorWrapper from '$studio/common/components/ModifierInspectorWrapper'

type Props = {
  list: $FixMe
  pathToModifierInstantiationDescriptor: string[]
}

export class SetAttributeInspector extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {list} = this.props
    // @todo ux - sort these alphabetically
    const body = map(list, (id: string) => {
      return (
        <SingleAttributeInspector
          key={id}
          id={id}
          pathToPairings={[
            ...this.props.pathToModifierInstantiationDescriptor,
            'props',
            'pairings',
          ]}
        />
      )
    })

    return <ModifierInspectorWrapper title="Custom Attributes" body={body} />
  }
}

export default compose(
  connect((s, op: any) => {
    return {
      list: get(s, op.pathToModifierInstantiationDescriptor).props.pairings
        .list,
    }
  }),
)(SetAttributeInspector)
