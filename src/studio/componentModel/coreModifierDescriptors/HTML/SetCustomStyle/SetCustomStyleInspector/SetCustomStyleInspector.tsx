import {map, get} from '$shared/utils'
import SingleCustomStyleInspector from '$theater/componentModel/coreModifierDescriptors/HTML/SetCustomStyle/SetCustomStyleInspector/SingleCustomStyleInspector'
import ModifierInspectorWrapper from '$theater/common/components/ModifierInspectorWrapper'
import {ITheaterStoreState} from '$theater/types'
import React from 'react'
import connect from '$theater/handy/connect'

interface IOwnProps {
  pathToModifierInstantiationDescriptor: string[]
}

interface Props extends IOwnProps {
  list: string[]
}

export class SetCustomStyleInspector extends React.PureComponent<Props, {}> {
  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {list} = this.props
    // @todo ux - sort these alphabetically
    const body = map(list, (id: string) => {
      return (
        <SingleCustomStyleInspector
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

    return <ModifierInspectorWrapper title="Custom Styles" body={body} />
  }
}

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  return {
    list: get(s, op.pathToModifierInstantiationDescriptor).props.pairings.list,
  }
})(SetCustomStyleInspector)
