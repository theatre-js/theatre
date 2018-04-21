import React from 'react'
import {
  VolatileId,
  GenericNode as MGenericNode,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TheaterComponent, {
  isTheaterComponent,
} from '../componentModel/react/TheaterComponent/TheaterComponent'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Studio from '$studio/bootstrap/Studio'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import Node from './Node'
import {reduceAhistoricState} from '$studio/bootstrap/actions'
import {omit} from 'lodash'
import NodeTemplate from './NodeTemplate'
import {TaggedDisplayName} from './NodeTemplate'

type Props = {
  depth: number
  volatileId: VolatileId
}

const RegularNode = (props: Props) => (
  <PropsAsPointer props={props}>
    {(propsP: Pointer<Props>, studio) => {
      const volatileId = val(propsP.volatileId)

      const nodeP = studio.elementTree.mirrorOfReactTreeAtom.pointer
        .nodesByVolatileId[volatileId] as Pointer<MGenericNode>

      const isSelected =
        val(
          studio.atom2.pointer.ahistoricComponentModel
            .selectedElementVolatileId,
        ) === volatileId

      const isExpanded =
        val(
          studio.atom2.pointer.ahistoricComponentModel
            .collapsedElementsByVolatileId[volatileId],
        ) !== true

      const nativeNode = val(nodeP.nativeNode)
      if (!nativeNode) return null

      // @todo
      const ancestorOfSelectedNode = false
      // @todo
      const toggleExpansion = () => {
        if (isExpanded) {
          studio.store.reduxStore.dispatch(
            reduceAhistoricState(
              [
                'ahistoricComponentModel',
                'collapsedElementsByVolatileId',
                volatileId,
              ] as $FixMe,
              () => true,
            ),
          )
        } else {
          studio.store.reduxStore.dispatch(
            reduceAhistoricState(
              ['ahistoricComponentModel', 'collapsedElementsByVolatileId'],
              s => omit(s, volatileId),
            ),
          )
        }
      }

      let isSelectable = false
      if (isTheaterComponent(nativeNode)) {
        const cls = nativeNode.constructor as $FixMe
        if (cls.componentType === 'Declarative') isSelectable = true
      }

      const displayName: string = getDisplayName(nativeNode, studio).getValue()

      let childrenNodes: React.ReactNode = null
      const depth = val(propsP.depth)
      const shouldSwallowChild =
        (nativeNode.constructor as $FixMe).shouldSwallowChild === true

      const volatileIdsOfChildrenP = !shouldSwallowChild
        ? nodeP.volatileIdsOfChildren
        : (studio.elementTree.mirrorOfReactTreeAtom.pointer.nodesByVolatileId[
            val(nodeP.volatileIdsOfChildren)[0]
          ] as Pointer<MGenericNode>).volatileIdsOfChildren

      const volatileIdsOfChildren = val(volatileIdsOfChildrenP)
      const numberOfChildren = volatileIdsOfChildren.length
      const hasChildren = numberOfChildren > 0

      if (isExpanded && hasChildren) {
        const childDepth = depth + 1
        childrenNodes = val(volatileIdsOfChildrenP).map(childVolatileId => (
          <Node
            key={`child-${childVolatileId}`}
            volatileId={childVolatileId}
            depth={childDepth}
          />
        ))
      }

      return (
        <NodeTemplate
          isSelected={isSelected}
          isExpanded={isExpanded}
          ancestorOfSelectedNode={ancestorOfSelectedNode}
          depth={depth}
          toggleExpansion={toggleExpansion}
          select={
            isSelectable
              ? () => {
                  markElementAsSelected(studio, volatileId)
                }
              : undefined
          }
          hasChildren={hasChildren}
          childrenNodes={childrenNodes}
          name={<TaggedDisplayName name={displayName} />}
          canHaveChildren={true}
        />
      )
    }}
  </PropsAsPointer>
)

export default RegularNode

const getDisplayName = (
  node:
    | Element
    | React.Component<mixed, mixed>
    | TheaterComponent<$IntentionalAny>,
  studio: Studio,
): AbstractDerivation<string> =>
  autoDerive(() => {
    if (isTheaterComponent(node)) {
      const cls = node.constructor as $FixMe
      if (cls.componentType !== 'Declarative') {
        return cls.displayName
      } else {
        return val(
          // @ts-ignore @todo
          getComponentDescriptor(studio.atom2.pointer, cls.componentId)
            .displayName,
        )
      }
    } else if (node instanceof Element) {
      return node.tagName
    } else if (!node) {
      return ''
    } else {
      const cls = node.constructor as $FixMe
      return cls.displayName || cls.name
    }
  })

function markElementAsSelected(studio: Studio, volatileId: string) {
  studio.store.reduxStore.dispatch(
    reduceAhistoricState(
      ['ahistoricComponentModel', 'selectedElementVolatileId'],
      () => volatileId,
    ),
  )
}
