import {React, connect, typeSystem} from '$studio/handy'
import {ValueEditor} from '$studio/structuralEditor'
import {ComponentDescriptor, ComponentId} from '$studio/componentModel/types'
import * as componentModelSelectors from '$studio/componentModel/selectors'
import PaleMessage from '$src/studio/common/components/PaleMessage'
import Panel from '$src/studio/workspace/components/Panel/Panel'
import {IStoreState} from '$studio/types'

interface IOwnProps {
  inputs: $FixMe
}

type ILP =
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

type IProps = IOwnProps & ILP

interface IState {}

class ComposePanelContent extends React.PureComponent<IProps, IState> {
  static panelName = 'Compose'
  render() {
    const {
      componentId,
      pathToComopnentDescriptor,
      componentDescriptor,
    } = this.props

    return (
      <Panel>
        {!componentId || !pathToComopnentDescriptor || !componentDescriptor ? (
          <PaleMessage message={`Select an element from the Explorer pane`} />
        ) : componentDescriptor.type === 'HardCoded' ? (
          // @todo we should either direct the user to select the owner of this component, OR,
          // in the case of user-provided hard-coded components, allow the user to navigate to
          // the code of that component (in their own code editor – we don't provide a JS editor)
          <PaleMessage
            message={`<${
              componentDescriptor.displayName
            }> is a hard-coded component`}
          />
        ) : (
          <ValueEditor
            path={pathToComopnentDescriptor}
            typeName={typeSystem.types.DeclarativeComponentDescriptor.typeName}
          />
        )}
      </Panel>
    )
  }
}

export default connect((s: IStoreState, op: IOwnProps): ILP => {
  const possibleComponentId =
    op.inputs.selectedNode && op.inputs.selectedNode.componentId
  if (!possibleComponentId) {
    return {
      pathToComopnentDescriptor: undefined,
      componentDescriptor: undefined,
      componentId: undefined
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
