import React from 'react'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Panel from '$studio/workspace/components/Panel/Panel'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {
  getVolatileIdOfActiveNode,
  getComponentIdOfNode,
} from '$studio/ExploreFlyoutMenu/utils'
import {getPathToComponentDescriptor} from '$studio/componentModel/selectors'
import {Pointer} from '$shared/DataVerse/pointer'
import {IDeclarativeComponentDescriptor} from '$studio/componentModel/types'
import * as _ from '$shared/utils'
import {val, pathTo} from '$shared/DataVerse/atom'
import TimelineInstantiator from '$studio/AnimationTimelinePanel/TimelineInstantiator'
import DerivationAsReactElement from '$shared/utils/react/DerivationAsReactElement'
import PureComponentWithTheatre from '$studio/handy/PureComponentWithTheatre'

class AnimationTimelinePanel extends PureComponentWithTheatre<{}, void> {
  _d: AbstractDerivation<React.ReactNode>
  static panelName = 'AnimationTimeline'

  constructor(props: {}, context: $IntentionalAny) {
    super(props, context)
    const EmptyPanel = <Panel key="emptyPanel" />
    const studio = this.studio

    this._d = autoDerive(() => {
      const volatileIdOfSelectedElement = getVolatileIdOfActiveNode(studio)
      if (!volatileIdOfSelectedElement) return EmptyPanel
      const selectedElement = studio.studio.elementTree.mirrorOfReactTree.getNativeElementByVolatileId(
        volatileIdOfSelectedElement,
      )
      if (!selectedElement) return EmptyPanel

      const activeComponentId = getComponentIdOfNode(selectedElement)

      if (!activeComponentId) return EmptyPanel

      const pathToComponent = getPathToComponentDescriptor(activeComponentId)

      const componentP: Pointer<IDeclarativeComponentDescriptor> = _.get(
        studio.atom2.pointer,
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
