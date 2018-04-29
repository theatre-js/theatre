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
import LeftPanelHeader from './LeftPanelHeader'
import {getActiveNode} from '../ExploreFlyoutMenu/utils'
import Studio from '$studio/bootstrap/Studio'
import {isViewportNode} from '$studio/workspace/components/WhatToShowInBody/Viewports/Viewport'
import ViewportEditor from '$studio/structuralEditor/components/editorsPerType/ViewportEditor/ViewportEditor'

type IProps = {}

interface IState {}

export default class ComposePanelContent extends React.PureComponent<
  IProps,
  IState
> {
  static panelName = 'Component'
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {(_: Pointer<IProps>, studio) => {
          return (
            <Panel header={<LeftPanelHeader />}>
              {renderEditorForEitherLeftOrRightPanel('left', studio)}
            </Panel>
          )
        }}
      </PropsAsPointer>
    )
  }
}

export const renderEditorForEitherLeftOrRightPanel = (
  leftOrRight: 'left' | 'right',
  studio: Studio,
) => {
  const possibleActiveNode = getActiveNode(studio)
  if (!possibleActiveNode) {
    return <PaleMessage message={`Select an element from the Explorer pane`} />
  }

  const activeNode = possibleActiveNode

  if (isViewportNode(activeNode)) {
    if (leftOrRight === 'left') {

      const viewportId = activeNode.viewportId
      return <ViewportEditor viewportId={viewportId} partsToShow={['dims', 'scene']} />
    } else { return null}
  }

  const possibleComponentId = getComponentIdOfActiveNode(studio)

  if (!possibleComponentId) {
    return <PaleMessage message={`Select an element from the Explorer pane`} />
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
      <PaleMessage
        message={`<${val(
          componentDescriptorP.displayName,
        )}> is a hard-coded component`}
      />
    )
  } else {
    return (
      <ValueEditor
        path={pathToComopnentDescriptor}
        typeName={typeSystem.types.DeclarativeComponentDescriptor.typeName}
        config={{
          partsToShow:
            leftOrRight === 'left' ? ['name', 'template'] : ['modifiers'],
        }}
      />
    )
  }
}
