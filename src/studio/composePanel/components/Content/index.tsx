// @flow
import {React, connect, shouldUpdate, typeSystem} from '$studio/handy'
import css from './index.css'
import {ValueEditor} from '$studio/structuralEditor'
import {ComponentDescriptor, ComponentId} from '$studio/componentModel/types'
import * as componentModelSelectors from '$studio/componentModel/selectors'
import PaleMessage from '$src/studio/common/components/PaleMessage'
// import ListOfModifierInstantiationDescriptorsInspector from './ListOfModifierInstantiationDescriptorsInspector'

type Props =
  | {
      componentId: void
      pathToComopnentDescriptor: void
      componentDescriptor: void
    }
  | {
      componentId: ComponentId
      pathToComopnentDescriptor: Array<string>
      componentDescriptor: ComponentDescriptor
    }

interface IState {}

export class ComposePanelContent extends React.PureComponent<Props, IState> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {
      componentId,
      pathToComopnentDescriptor,
      componentDescriptor,
    } = this.props

    if (!componentId || !pathToComopnentDescriptor || !componentDescriptor)
      return (
        <PaleMessage message={`Select an element from the Explorer pane`} />
      )

    if (componentDescriptor.type === 'HardCoded') {
      return (
        // @todo we should either direct the user to select the owner of this component, OR,
        // in the case of user-provided hard-coded components, allow the user to navigate to
        // the code of that component (in their own code editor – we don't provide a JS editor)
        <PaleMessage message={`${componentDescriptor.displayName} is hard-coded component`} />
      )
    } else {
      return (
        <ValueEditor
          path={pathToComopnentDescriptor}
          typeName={typeSystem.types.DeclarativeComponentDescriptor.typeName}
        />
      )
    }
  }

  // _renderCaseComponentInstantiationValueDescriptor(
  //   des: ComponentInstantiationValueDescriptor,
  //   path: Array<string>,
  // ) {
  //   const {modifierInstantiationDescriptors} = des

  //   return (
  //     <ListOfModifierInstantiationDescriptorsInspector
  //       pathToComopnentDescriptor={[
  //         ...path,
  //         'modifierInstantiationDescriptors',
  //       ]}
  //       modifierInstantiationDescriptors={modifierInstantiationDescriptors}
  //     />
  //   )
  // }
}

const connected = connect((s, op) => {
  // const possibleComponentId = s.composePanel.componentId || 'FakeDeclarativeButton'
  const possibleComponentId =
    op.inputs.selectedNode && op.inputs.selectedNode.componentId
  if (!possibleComponentId) {
    return {
      pathToComopnentDescriptor: undefined,
      componentDescriptor: undefined,
    }
  }

  const componentId = possibleComponentId
  const pathToComopnentDescriptor = componentModelSelectors.getPathToComponentDescriptor(
    componentId,
  )
  const componentDescriptor = componentModelSelectors.getComponentDescriptor(
    s,
    componentId,
  )

  return {
    pathToComopnentDescriptor,
    componentDescriptor,
    componentId,
  }
})(ComposePanelContent)

export default shouldUpdate(
  (prev: $FixMe, next: $FixMe) => prev.inputs.selectedNode !== next.inputs.selectedNode,
)(connected)
