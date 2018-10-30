import {ValueEditor} from '$studio/structuralEditor'
import {IComponentId} from '$studio/componentModel/types'
import * as componentModelSelectors from '$studio/componentModel/selectors'
import PaleMessage from '$studio/common/components/PaleMessage'
import Panel from '$studio/workspace/components/Panel/Panel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {getComponentIdOfActiveNode} from '$studio/ExploreFlyoutMenu/utils'
import React from 'react'
import * as typeSystem from '$studio/typeSystem'
import LeftPanelHeader from './LeftPanelHeader'
import {getActiveNode} from '../ExploreFlyoutMenu/utils'
import Theater from '$studio/bootstrap/Theater'
import {isViewportNode} from '$studio/workspace/components/WhatToShowInBody/Viewports/Viewport'
import ViewportEditor from '$studio/structuralEditor/components/editorsPerType/ViewportEditor/ViewportEditor'
import {TheaterConsumer} from '$studio/componentModel/react/utils/studioContext'

type IProps = {}

interface IState {}

export default class ComposePanelContent extends React.PureComponent<
  IProps,
  IState
> {
  static panelName = 'Component'
  render() {
    return (
      <TheaterConsumer>
        {studio => (
          <PropsAsPointer props={this.props}>
            {() => {
              return (
                <Panel header={<LeftPanelHeader />}>
                  {renderEditorForEitherLeftOrRightPanel('left', studio)}
                </Panel>
              )
            }}
          </PropsAsPointer>
        )}
      </TheaterConsumer>
    )
  }
}

export const renderEditorForEitherLeftOrRightPanel = (
  leftOrRight: 'left' | 'right',
  studio: Theater,
) => {
  const possibleActiveNode = getActiveNode(studio)
  if (!possibleActiveNode) {
    return <PaleMessage message={`Select an element from the Explorer pane`} />
  }

  const activeNode = possibleActiveNode

  if (isViewportNode(activeNode)) {
    if (leftOrRight === 'left') {
      const viewportId = activeNode.viewportId
      return (
        <ViewportEditor
          viewportId={viewportId}
          partsToShow={['dims', 'scene']}
        />
      )
    } else {
      return null
    }
  }

  const possibleComponentId = getComponentIdOfActiveNode(studio)

  if (!possibleComponentId) {
    return <PaleMessage message={`Select an element from the Explorer pane`} />
  }

  const componentId = possibleComponentId as IComponentId

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
