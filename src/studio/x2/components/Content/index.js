// @flow
import {compose, React, connect} from '$studio/handy'
import css from './index.css'
import get from 'lodash/get'
import type {
  // PathToLocalHiddenValueDescriptor,
  ComponentInstantiationValueDescriptor,
} from '$studio/componentModel/types'
import ListOfModifierInstantiationDescriptorsInspector from './ListOfModifierInstantiationDescriptorsInspector'

export type PathToInspectableInX2 = Array<string> // For now, must point to a PathToLocalHiddenValueDescriptor

export type InspectableInX2 = ComponentInstantiationValueDescriptor // later, we'll also be able to inspect a style selector's rules

type Props =
  | {thePath: void, inspectable: void}
  | {thePath: PathToInspectableInX2, inspectable: ?InspectableInX2}

type State = {}

export class Content extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {inspectable, thePath} = this.props
    if (!thePath || !inspectable)
      return <div className={css.container}>Nothing to inspect</div>

    switch (inspectable.__descriptorType) {
      case 'ComponentInstantiationValueDescriptor':
        return this._renderCaseComponentInstantiationValueDescriptor(
          inspectable,
          thePath,
        )
      default:
        console.error(
          `Inspectable type '${inspectable.__descriptorType}' not supported`,
        )
        return (
          <div className={css.container}>
            Error occured. Logged into console
          </div>
        )
    }
  }

  _renderCaseComponentInstantiationValueDescriptor(
    des: ComponentInstantiationValueDescriptor,
    path: Array<string>,
  ) {
    const {modifierInstantiationDescriptors} = des

    return (
      <ListOfModifierInstantiationDescriptorsInspector
        thePath={[...path, 'modifierInstantiationDescriptors']}
        modifierInstantiationDescriptors={modifierInstantiationDescriptors}
      />
    )
  }
}

export default compose(
  connect(s => {
    const thepath = s.x2.pathToInspectableInX2
    const inspectable = get(s, thepath)
    return {
      thePath: thepath,
      inspectable,
    }
  }),
)(Content)
