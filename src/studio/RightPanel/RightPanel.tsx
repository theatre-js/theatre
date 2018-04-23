import {ValueEditor} from '$studio/structuralEditor'
import {ComponentId} from '$studio/componentModel/types'
import * as componentModelSelectors from '$studio/componentModel/selectors'
import PaleMessage from '$src/studio/common/components/PaleMessage'
import Panel from '$src/studio/workspace/components/Panel/Panel'
import PropsAsPointer from '../handy/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {getComponentIdOfActiveNode} from '$studio/ExploreFlyoutMenu/utils'
import React from 'react'
import * as typeSystem from '$studio/typeSystem'

type IProps = {}

interface IState {}

export default class RightPanel extends React.PureComponent<
  IProps,
  IState
> {
  static panelName = 'Right'
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {(_: Pointer<IProps>, studio) => {
          const possibleComponentId = getComponentIdOfActiveNode(studio)

          if (!possibleComponentId) {
            return <Wrapper>Right panel here</Wrapper>
            // return <Wrapper>{range(0, 100).map((i) => <div key={"blah" + i}>{i}</div>)}</Wrapper>
            // return (
            //   <Wrapper>
            //     <PaleMessage
            //       message={`Select an element from the Explorer pane`}
            //     />
            //   </Wrapper>
            // )
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
              <Wrapper>
                <PaleMessage
                  message={`<${val(
                    componentDescriptorP.displayName,
                  )}> is a hard-coded component`}
                />
              </Wrapper>
            )
          } else {
            return (
              <Wrapper>
                <ValueEditor
                  path={pathToComopnentDescriptor}
                  typeName={
                    typeSystem.types.DeclarativeComponentDescriptor.typeName
                  }
                />
              </Wrapper>
            )
          }
        }}
      </PropsAsPointer>
    )
  }
}

const Wrapper = ({children}: {children: React.ReactNode}) => {
  return <Panel>{children}</Panel>
}
