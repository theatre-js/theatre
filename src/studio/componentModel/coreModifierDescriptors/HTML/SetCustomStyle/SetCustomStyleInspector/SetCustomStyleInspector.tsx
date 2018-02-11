// @flow
import {compose, React, connect} from '$src/studio/handy'
import map from 'lodash/map'
import get from 'lodash/get'
import SingleCustomStyleInspector from '$src/studio/componentModel/coreModifierDescriptors/HTML/SetCustomStyle/SetCustomStyleInspector/SingleCustomStyleInspector'
import ModifierInspectorWrapper from '$src/studio/common/components/ModifierInspectorWrapper'

type Props = {
  list: $FixMe
  pathToModifierInstantiationDescriptor: Array<string>
}

export class SetCustomStyleInspector extends React.PureComponent<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const {list} = this.props
    // @todo ux - sort these alphabetically
    const body = map(list, (id, index) => {
      return (
        <SingleCustomStyleInspector
          key={id}
          id={id}
          index={index}
          pathToPairings={[
            ...this.props.pathToModifierInstantiationDescriptor,
            'props',
            'pairings',
          ]}
        />
      )
    })

    return <ModifierInspectorWrapper title="Custom Styles" body={body} />
  }
}

export default compose(
  connect((s, op: any) => {
    return {
      list: get(s, op.pathToModifierInstantiationDescriptor).props.pairings
        .list,
    }
  }),
)(SetCustomStyleInspector)
