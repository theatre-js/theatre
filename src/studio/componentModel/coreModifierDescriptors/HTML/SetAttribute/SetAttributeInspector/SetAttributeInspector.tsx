import {map, get} from '$shared/utils'
import SingleAttributeInspector from './SingleAttributeInspector'
import ModifierInspectorWrapper from '$studio/common/components/ModifierInspectorWrapper'
import {ITheaterStoreState} from '$studio/types'
import React from 'react'
import connect from '$studio/handy/connect'

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

export default connect((s: ITheaterStoreState, op: IOwnProps) => {
  return {
    list: get(s, op.pathToModifierInstantiationDescriptor).props.pairings.list,
  }
})(SetAttributeInspector)
