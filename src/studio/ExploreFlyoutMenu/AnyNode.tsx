import React from 'react'
import {
  VolatileId,
  GenericNode,
} from '$theater/integrations/react/treeMirroring/MirrorOfReactTree'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import TextNode from './TextNode'
import RegularNode from './RegularNode'
import {isViewportNode} from '$theater/workspace/components/WhatToShowInBody/Viewports/Viewport'
import ViewportNode from './ViewportNode'
import {TheaterConsumer} from '$theater/componentModel/react/utils/theaterContext'

type Props = {
  depth: number
  volatileId: VolatileId
}

const AnyNode = (props: Props): React.ReactElement<any> => (
  <TheaterConsumer>
    {theater => (
      <PropsAsPointer props={props}>
        {({props: propsP}) => {
          // @todo @perf if depth and volatileId never change per Node, then we should read them directly from props
          const volatileId = val(propsP.volatileId)

          const nodeP =
            theater.studio.elementTree.mirrorOfReactTreeAtom.pointer
              .nodesByVolatileId[volatileId]

          const type = val(nodeP.type)

          if (type === 'Text') {
            return (
              <TextNode
                volatileId={val(propsP.volatileId)}
                depth={val(propsP.depth)}
              />
            )
          } else if (type === 'Wrapper') {
            debugger
            throw new Error(`@todo Find a way to display Wrapper nodes`)
          } else {
            const nativeNode = val((nodeP as Pointer<GenericNode>).nativeNode)
            if (isViewportNode(nativeNode)) {
              return (
                <ViewportNode
                  volatileId={val(propsP.volatileId)}
                  depth={val(propsP.depth)}
                />
              )
            } else {
              return (
                <RegularNode
                  volatileId={val(propsP.volatileId)}
                  depth={val(propsP.depth)}
                />
              )
            }
          }
        }}
      </PropsAsPointer>
    )}
  </TheaterConsumer>
)

export default AnyNode
