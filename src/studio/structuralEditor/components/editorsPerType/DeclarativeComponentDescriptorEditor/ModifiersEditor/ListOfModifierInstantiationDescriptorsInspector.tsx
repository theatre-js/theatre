// @flow
import {compose, React, connect} from '$studio/handy'
import {IModifierInstantiationValueDescriptors} from '$studio/componentModel/types'
import ModifierInstantiationDescriptorInspector from './ModifierInstantiationDescriptorInspector'
import get from 'lodash/get'

type Props = {
  modifierInstantiationDescriptors: IModifierInstantiationValueDescriptors
  pathToModifierInstantiationDescriptors: Array<string>
  listOfModifierInstantiationDescriptors: Array<string>
}

type State = {}

export class ListOfModifierInstantiationDescriptorsInspector extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {pathToModifierInstantiationDescriptors} = this.props
    return this.props.listOfModifierInstantiationDescriptors.map(
      (id: string, index: number) => {
        const modifierInstantiationDescriptor = this.props
          .modifierInstantiationDescriptors.byId[id]
        return (
          <ModifierInstantiationDescriptorInspector
            pathToModifierInstantiationDescriptor={[
              ...pathToModifierInstantiationDescriptors,
              'byId',
              id,
            ]}
            key={id}
            id={id}
            index={index}
            modifierInstantiationDescriptor={modifierInstantiationDescriptor}
          />
        )
      },
    )
  }
}

export default compose(
  connect((s, op) => {
    return {
      listOfModifierInstantiationDescriptors: get(s, [
        ...op.pathToModifierInstantiationDescriptors,
        'list',
      ]),
    }
  }),
)(ListOfModifierInstantiationDescriptorsInspector)
