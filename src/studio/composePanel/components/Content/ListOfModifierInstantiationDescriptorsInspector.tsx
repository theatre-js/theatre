// @flow
import {compose, React, connect} from '$studio/handy'
import {ModifierInstantiationValueDescriptors} from '$studio/componentModel/types'
import ModifierInstantiationDescriptorInspector from './ModifierInstantiationDescriptorInspector'
import get from 'lodash/get'

type Props = {
  modifierInstantiationDescriptors: ModifierInstantiationValueDescriptors,
  thePath: Array<string>,
  list: Array<string>,
}

type State = {}

export class ListOfModifierInstantiationDescriptorsInspector extends React.PureComponent<
  Props,
  State,
> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {thePath} = this.props
    return this.props.list.map((id: string, index: number) => {
      const modifierInstantiationDescriptor = this.props
        .modifierInstantiationDescriptors.byId[id]
      return (
        <ModifierInstantiationDescriptorInspector
          pathToModifierInstantiationDescriptor={[...thePath, 'byId', id]}
          key={id}
          id={id}
          index={index}
          modifierInstantiationDescriptor={modifierInstantiationDescriptor}
        />
      )
    })
  }
}

export default compose(
  connect((s, op) => {
    return {
      list: get(s, [...op.thePath, 'list']),
    }
  }),
)(ListOfModifierInstantiationDescriptorsInspector)
