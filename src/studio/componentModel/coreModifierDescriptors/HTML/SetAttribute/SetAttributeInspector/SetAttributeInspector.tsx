import {compose, React, connect} from '$studio/handy'
import {map, get} from 'lodash'
import SingleAttributeInspector from './SingleAttributeInspector'
import ModifierInspectorWrapper from '$studio/common/components/ModifierInspectorWrapper'
import {IStudioStoreState} from '$studio/types'

interface IOwnProps {
  pathToModifierInstantiationDescriptor: string[]
}

interface IProps extends IOwnProps {
  list: string[]
}

export class SetAttributeInspector extends React.PureComponent<IProps, {}> {
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

export default connect((s: IStudioStoreState, op: IOwnProps) => {
  return {
    list: get(s, op.pathToModifierInstantiationDescriptor).props.pairings.list,
  }
})(SetAttributeInspector)
