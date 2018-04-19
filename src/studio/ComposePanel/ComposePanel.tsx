import {ValueEditor} from '$studio/structuralEditor'
import {ComponentId} from '$studio/componentModel/types'
import * as componentModelSelectors from '$studio/componentModel/selectors'
import PaleMessage from '$src/studio/common/components/PaleMessage'
import Panel from '$src/studio/workspace/components/Panel/Panel'
import PropsAsPointer from '../handy/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {getComponentIdOfSelectedElement} from '$studio/componentModel/utils'
import React from 'react'
import * as typeSystem from '$studio/typeSystem'

type IProps = {}

interface IState {}

// const ComposePanelContent = (props: IProps): React.ReactNode => (

// )

export default class ComposePanelContent extends React.PureComponent<
  IProps,
  IState
> {
  static panelName = 'Compose'
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {(_: Pointer<IProps>, studio) => {
          const possibleComponentId = getComponentIdOfSelectedElement(studio)

          if (!possibleComponentId) {
            return (
              <Panel>
                <PaleMessage
                  message={`Select an element from the Explorer pane`}
                />
              </Panel>
            )
          }

          const componentId = possibleComponentId as ComponentId

          const pathToComopnentDescriptor = componentModelSelectors.getPathToComponentDescriptor(
            componentId,
          )

          const componentDescriptorP = componentModelSelectors.getComponentDescriptor(
            studio.atom2.pointer,
            componentId,
          )

          const type = val(componentDescriptorP.type)

          if (type === 'HardCoded') {
            return (
              <Panel>
                <PaleMessage
                  message={`<${val(
                    componentDescriptorP.displayName,
                  )}> is a hard-coded component`}
                />
              </Panel>
            )
          } else {
            return (
              <Panel>
                <ValueEditor
                  path={pathToComopnentDescriptor}
                  typeName={
                    typeSystem.types.DeclarativeComponentDescriptor.typeName
                  }
                />
              </Panel>
            )
          }
        }}
      </PropsAsPointer>
    )

    // const {
    //   componentId,
    //   pathToComopnentDescriptor,
    //   componentDescriptor,
    // } = this.props

    // return (
    //   <Panel>
    //     {!componentId || !pathToComopnentDescriptor || !componentDescriptor ? (
    //       <PaleMessage message={`Select an element from the Explorer pane`} />
    //     ) : componentDescriptor.type === 'HardCoded' ? (
    //       // @todo we should either direct the user to select the owner of this component, OR,
    //       // in the case of user-provided hard-coded components, allow the user to navigate to
    //       // the code of that component (in their own code editor – we don't provide a JS editor)
    //       <PaleMessage
    //         message={`<${
    //           componentDescriptor.displayName
    //         }> is a hard-coded component`}
    //       />
    //     ) : (
    //       <ValueEditor
    //         path={pathToComopnentDescriptor}
    //         typeName={typeSystem.types.DeclarativeComponentDescriptor.typeName}
    //       />
    //     )}
    //   </Panel>
    // )
  }
}

// export default connect((s: IStudioStoreState, op: IOwnProps): ILP => {
//   // const possibleComponentId =
//   //   op.inputs.selectedNode && op.inputs.selectedNode.componentId

//   return {
//     pathToComopnentDescriptor,
//     componentDescriptor,
//     componentId,
//   }
// })(ComposePanelContent)
