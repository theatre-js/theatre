import React from 'react'
import {
  VolatileId,
  GenericNode as MGenericNode,
} from '$theater/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TheaterComponent, {
  isTheaterComponent,
} from '../componentModel/react/TheaterComponent/TheaterComponent'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Theater from '$theater/bootstrap/Theater'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {getComponentDescriptor} from '$theater/componentModel/selectors'
import NodeTemplate, {TaggedDisplayName} from './NodeTemplate'
import {TheaterConsumer} from '$theater/componentModel/react/utils/theaterContext'

type Props = {
  depth: number
  volatileId: VolatileId
}

const RegularNode = (props: Props) => (
  <TheaterConsumer>
    {theater => (
      <PropsAsPointer props={props}>
        {({props: propsP}) => {
          const volatileId = val(propsP.volatileId)

          const nodeP = theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
            .nodesByVolatileId[volatileId] as Pointer<MGenericNode>

          const nativeNode = val(nodeP.nativeNode)
          if (!nativeNode) return null

          let isSelectable = false
          if (isTheaterComponent(nativeNode)) {
            const cls = nativeNode.constructor as $FixMe
            if (cls.componentType === 'Declarative') isSelectable = true
          }

          const displayName: string = getDisplayName(
            nativeNode,
            theater,
          ).getValue()

          const depth = val(propsP.depth)
          const shouldSwallowChild =
            (nativeNode.constructor as $FixMe).shouldSwallowChild === true

          const volatileIdsOfChildrenP = !shouldSwallowChild
            ? nodeP.volatileIdsOfChildren
            : (theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
                .nodesByVolatileId[
                val(nodeP.volatileIdsOfChildren)[0]
              ] as Pointer<MGenericNode>).volatileIdsOfChildren

          const volatileIdsOfChildren = val(volatileIdsOfChildrenP)

          return (
            <NodeTemplate
              depth={depth}
              volatileIdsOfChildren={volatileIdsOfChildren}
              name={<TaggedDisplayName name={displayName} />}
              isSelectable={isSelectable}
              volatileId={volatileId}
            />
          )
        }}
      </PropsAsPointer>
    )}
  </TheaterConsumer>
)

export default RegularNode

const getDisplayName = (
  node:
    | Element
    | React.Component<mixed, mixed>
    | TheaterComponent<$IntentionalAny>,
  theater: Theater,
): AbstractDerivation<string> =>
  autoDerive(() => {
    if (isTheaterComponent(node)) {
      const cls = node.constructor as $FixMe
      if (cls.componentType !== 'Declarative') {
        return cls.displayName
      } else {
        return val(
          // @ts-ignore @todo
          getComponentDescriptor(theater.atom2.pointer, cls.componentId)
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
