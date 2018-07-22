import {ValueEditor} from '$theater/structuralEditor'
import {IComponentId} from '$theater/componentModel/types'
import * as componentModelSelectors from '$theater/componentModel/selectors'
import PaleMessage from '$theater/common/components/PaleMessage'
import Panel from '$theater/workspace/components/Panel/Panel'
import PropsAsPointer from '../handy/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {getComponentIdOfActiveNode} from '$theater/ExploreFlyoutMenu/utils'
import React from 'react'
import * as typeSystem from '$theater/typeSystem'
import LeftPanelHeader from './LeftPanelHeader'
import {getActiveNode} from '../ExploreFlyoutMenu/utils'
import Theater from '$theater/bootstrap/Theater'
import {isViewportNode} from '$theater/workspace/components/WhatToShowInBody/Viewports/Viewport'
import ViewportEditor from '$theater/structuralEditor/components/editorsPerType/ViewportEditor/ViewportEditor'
import {TheaterConsumer} from '$theater/componentModel/react/utils/theaterContext'

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
        {theater => (
          <PropsAsPointer props={this.props}>
            {() => {
              return (
                <Panel header={<LeftPanelHeader />}>
                  {renderEditorForEitherLeftOrRightPanel('left', theater)}
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
  theater: Theater,
) => {
  const possibleActiveNode = getActiveNode(theater)
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

  const possibleComponentId = getComponentIdOfActiveNode(theater)

  if (!possibleComponentId) {
    return <PaleMessage message={`Select an element from the Explorer pane`} />
  }

  const componentId = possibleComponentId as IComponentId

  const pathToComopnentDescriptor = componentModelSelectors.getPathToComponentDescriptor(
    componentId,
  )

  const componentDescriptorP = componentModelSelectors.getComponentDescriptor(
    theater.atom2.pointer,
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
