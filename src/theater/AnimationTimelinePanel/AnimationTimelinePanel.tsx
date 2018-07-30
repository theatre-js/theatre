import React from 'react'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Panel from '$theater/workspace/components/Panel/Panel'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {
  getVolatileIdOfActiveNode,
  getComponentIdOfNode,
} from '$theater/ExploreFlyoutMenu/utils'
import {getPathToComponentDescriptor} from '$theater/componentModel/selectors'
import {Pointer} from '$shared/DataVerse2/pointer'
import {IDeclarativeComponentDescriptor} from '$theater/componentModel/types'
import _ from 'lodash'
import {val, pathTo} from '$shared/DataVerse2/atom'
import TimelineInstantiator from '$theater/AnimationTimelinePanel/TimelineInstantiator'
import DerivationAsReactElement from '$shared/utils/react/DerivationAsReactElement'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

class AnimationTimelinePanel extends PureComponentWithTheater<{}, void> {
  _d: AbstractDerivation<React.ReactNode>
  static panelName = 'AnimationTimeline'

  constructor(props: {}, context: $IntentionalAny) {
    super(props, context)
    const EmptyPanel = <Panel key="emptyPanel" />
    const theater = this.theater

    this._d = autoDerive(() => {
      const volatileIdOfSelectedElement = getVolatileIdOfActiveNode(theater)
      if (!volatileIdOfSelectedElement) return EmptyPanel
      const selectedElement = theater.studio.elementTree.mirrorOfReactTree.getNativeElementByVolatileId(
        volatileIdOfSelectedElement,
      )
      if (!selectedElement) return EmptyPanel

      const activeComponentId = getComponentIdOfNode(selectedElement)

      if (!activeComponentId) return EmptyPanel

      const pathToComponent = getPathToComponentDescriptor(activeComponentId)

      const componentP: Pointer<IDeclarativeComponentDescriptor> = _.get(
        theater.atom2.pointer,
        pathToComponent,
      )

      const componentType = val(componentP.__descriptorType)

      if (componentType !== 'DeclarativeComponentDescriptor') return EmptyPanel

      const defaultTimelineP =
        componentP.timelineDescriptors.byId.defaultTimeline
      const pathToTimeline = pathTo(defaultTimelineP)
      const defaultTimeline = val(defaultTimelineP)

      if (!defaultTimeline) return EmptyPanel

      // @ts-ignore @todo
      const props: Props = {
        pathToTimeline,
        volatileIdOfSelectedElement,
        selectedElement,
      }

      return <TimelineInstantiator key="actualPanel" {...props} />
    })
  }

  render() {
    return <DerivationAsReactElement derivation={this._d} />
  }
}

export default AnimationTimelinePanel
