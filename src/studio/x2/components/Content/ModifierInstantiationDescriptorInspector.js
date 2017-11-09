// @flow
import {compose, React, connect} from '$studio/handy'
import get from 'lodash/get'
import coreModifierDescriptors from '$studio/componentModel/coreModifierDescriptors'

type Props = {
  id: string,
  index: number,
  pathToModifierInstantiationDescriptor: Array<string>,
  modifierId: string,
}

type State = {}

export class ModifierInstantiationDescriptorInspector extends React.PureComponent<
  Props,
  State,
> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {modifierId} = this.props
    const modifierDescriptor = coreModifierDescriptors[modifierId]

    if (!modifierDescriptor) {
      console.error(`Invalid modifierId '${modifierId}'`)
      return 'Invalid modifier'
    }
    const {InspectorComponent} = modifierDescriptor
    if (!InspectorComponent) {
      console.error(
        `ModifierId '${modifierId}' doesn't have an InspectorComponent`,
      )
      return 'No inspector comopnent'
    }
    return (
      <InspectorComponent
        modifierId={modifierId}
        pathToModifierInstantiationDescriptor={
          this.props.pathToModifierInstantiationDescriptor
        }
      />
    )
  }
}

export default compose(
  connect((s, op) => {
    return {
      modifierId: get(s, [
        ...op.pathToModifierInstantiationDescriptor,
        'modifierId',
      ]),
    }
  }),
)(ModifierInstantiationDescriptorInspector)
