import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import atom, {Atom, val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import Panel from '$src/studio/workspace/components/Panel/Panel'
import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {StudioComponent} from '$studio/handy'
import MirrorOfReactTree, {
  GenericNode,
  isGenericNode,
  Node as MirrorNode,
  VolatileId,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'
import {PanelOutput} from '$studio/workspace/types'
import React from 'react'
import DerivationAsReactElement from '$studio/componentModel/react/utils/DerivationAsReactElement'
import css from './ExplorePanel.css'
import Node from './Node'

const isRenderCurrentCanvas = (node: MirrorNode): boolean => {
  if (!isGenericNode(node)) return false
  const nativeNode = node.nativeNode

  if (!isTheaterComponent(nativeNode)) return false

  if (
    (nativeNode.constructor as $IntentionalAny).componentId ===
    'TheaterJS/Core/RenderCurrentCanvas'
  ) {
    return true
  }
  return false
}

const getVolatileOdOfRenderCurrentCanvas = (
  mirror: MirrorOfReactTree,
): Promise<string> =>
  new Promise(resolve => {
    let foundNode: MirrorNode
    mirror.walk(node => {
      if (isRenderCurrentCanvas(node)) {
        foundNode = node
        return false
      } else {
        return undefined
      }
    })
    // @ts-ignore
    if (foundNode) {
      return resolve(foundNode.volatileId)
    }

    const onMount = (node: MirrorNode) => {
      if (isRenderCurrentCanvas(node)) {
        mirror.events.off('mount', onMount)
        resolve(node.volatileId)
      }
    }

    mirror.events.on('mount', onMount)
  })

type Props = {
  outputs: PanelOutput
  updatePanelOutput: Function
}

type State = {
  volatileIdOfRenderCurrentCanvas: undefined | string
}

class ExplorerPanel extends StudioComponent<Props, State> {
  mirror: MirrorOfReactTree
  atom: Atom<{volatileIdOfRenderCurrentCanvas: VolatileId | undefined}>
  static panelName = 'Explore'
  _children: AbstractDerivation<React.ReactNode>

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)

    this.mirror = this.studio._mirrorOfReactTree

    this.atom = atom({
      volatileIdOfRenderCurrentCanvas: undefined,
    })

    getVolatileOdOfRenderCurrentCanvas(this.studio._mirrorOfReactTree).then(
      volatileIdOfRenderCurrentCanvas => {
        this.atom.setState({volatileIdOfRenderCurrentCanvas})
      },
    )

    this._children = autoDerive(() => {
      const volatileIdOfRenderCurrentCanvas = val(
        this.atom.pointer.volatileIdOfRenderCurrentCanvas,
      )

      if (typeof volatileIdOfRenderCurrentCanvas !== 'string') {
        return null
      }

      const nodeP = this.mirror.atom.pointer.nodesByVolatileId[
        volatileIdOfRenderCurrentCanvas
      ] as Pointer<GenericNode>

      const volatileIdsOfChildren: VolatileId[] = val(
        nodeP.volatileIdsOfChildren,
      )

      return volatileIdsOfChildren.map(vid => {
        return <Node key={`node-for-${vid}`} volatileId={vid} depth={1} />
      })
    })
  }

  render() {
    // const {nodes, selectedNodePath} = this.state
    // const {outputs: {selectedNode}} = this.props
    return (
      <Panel>
        <div className={css.container}>
          <DerivationAsReactElement derivation={this._children} />
          {/*Object.keys(nodes).map(key => {
             return (
               <Node
                 key={key}
                 toggleExpansion={this.toggleNodeExpansionState}
                 selectNode={this.selectNode}
                 selectedNodePath={selectedNodePath}
                 {...nodes[key]}
               />
             )
           })*/}
        </div>
      </Panel>
    )
  }
}

export default ExplorerPanel
