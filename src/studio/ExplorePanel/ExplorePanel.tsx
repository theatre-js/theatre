import * as React from 'react'
import generateUniqueID from 'uuid/v4'
import {get} from 'lodash'
import {set} from 'lodash/fp'
import {PanelOutput} from '$studio/workspace/types'
import {Path} from '$studio/explorePanel/types'
import css from './ExplorePanel.css'
import Node from './Node'
import Panel from '$src/studio/workspace/components/Panel/Panel'
import {StudioComponent} from '$studio/handy'

type Props = {
  outputs: PanelOutput
  updatePanelOutput: Function
}

type State = {
  nodes: Object
  selectedNodePath: undefined | null | string[]
}

class ExplorerPanel extends StudioComponent<Props, State> {
  static panelName = 'Explore'

  rendererID: undefined | null | string
  _refMap: Object

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)

    this._subscribeToHookEvents(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

    this._refMap = new WeakMap()
    this.state = {nodes: {}, selectedNodePath: null}
    this.rendererID = undefined
    this.updateTimeout = null
  }

  _subscribeToHookEvents(hook: undefined | null | Object) {
    if (hook == null) throw Error('Dev tools hook not found!')
    hook.sub('root', (data: $FixMe) => {
      if (this.rendererID != null) return
      this.walkTree(data.internalInstance, (node) => {
        if (node.key === 'TheaterJS/Core/RenderCurrentCanvas#RenderCurrentCanvas') {
          this.rendererID = data.renderer
          this.debouncedAddNodes(hook)
          return true
        }
      })
    })
    hook.sub('mount', data => {
      if (data.renderer !== this.rendererID) return
      this.debouncedAddNodes(hook)
    })
    hook.sub('update', data => {
      if (data.renderer !== this.rendererID) return
      this.debouncedAddNodes(hook)
    })
    hook.sub('unmount', data => {
      if (data.renderer !== this.rendererID) return
      this.debouncedAddNodes(hook)
    })
  }

  debouncedAddNodes(hook) {
    clearTimeout(this.updateTimeout)
    this.updateTimeout = setTimeout(() => {
      this.addNodes.call(this, hook)
    }, 0)
  }

  addNodes(hook) {
    let theaterCurrentCanvasFiber
    const fiberRoot = hook
      .getFiberRoots(this.rendererID)
      .values()
      .next().value.current
    this.walkTree(fiberRoot, node => {
      let shouldBreak = false
      if (
        node.key === 'TheaterJS/Core/RenderCurrentCanvas#RenderCurrentCanvas'
      ) {
        theaterCurrentCanvasFiber = node.child
        shouldBreak = true
      }
      return shouldBreak
    })
    let refMap = new WeakMap()
    let nodes = {}
    this.walkTree(theaterCurrentCanvasFiber, (node, nodePath) => {
      ;({nodes, refMap} = this._addNodeData(node, nodePath, nodes, refMap))
    })
    this._refMap = refMap
    this.setState(() => ({nodes}))
  }

  walkTree(root, cb) {
    let branches = [{fiber: root, path: []}]

    outer: while (branches.length > 0) {
      let {fiber, path} = branches[branches.length - 1]
      branches = branches.slice(0, -1)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (fiber.sibling) {
          branches = [...branches, {fiber: fiber.sibling, path}]
        }

        const elementId =
          fiber.stateNode && typeof fiber.stateNode.elementId === 'number'
            ? generateUniqueID()
            : // ? String(fiber.stateNode.elementId + Math.random())
              generateUniqueID()

        // console.log(elementId)

        path = path.concat(elementId)
        const shouldBreak = cb(fiber, path) || false
        if (shouldBreak) break outer

        if (fiber.child) {
          fiber = fiber.child
          path = path.concat('children')
        } else {
          break
        }
      }
    }
  }

  _addNodeData(
    node: Object,
    path: Path,
    originalNodes: Object,
    refMap: Object,
  ) {
    const data = this._prepareNodeData(node, path)
    const modifiedNodes = set(path, data, originalNodes)
    refMap.set(node, path)
    return {nodes: modifiedNodes, refMap, path}
  }

  _prepareNodeData(reactObject: Object, path: Path) {
    const {stateNode} = reactObject

    return {
      data: {
        componentId: stateNode.getComponentId
          ? stateNode.getComponentId()
          : null,
      },
      isExpanded: true,
      path,
      _ref: reactObject,
    }
  }

  toggleNodeExpansionState = (path: Path) => {
    this.setState(state => {
      const isExpandedPath = path.concat('isExpanded')
      const modifiedNodes = set(
        isExpandedPath,
        !get(state.nodes, isExpandedPath),
        state.nodes,
      )
      return {nodes: modifiedNodes}
    })
  }

  selectNode = (path: Path, elementId: undefined | number) => {
    const {data: selectedNode} = get(this.state.nodes, path)
    this.props.updatePanelOutput({selectedNode})
    this.reduceState(
      [
        'workspace',
        'panels',
        'byId',
        'timelinePanel',
        'configuration',
        'elementId',
      ],
      () => elementId,
    )
    this.setState(() => ({selectedNodePath: path}))
  }

  render() {
    const {nodes, selectedNodePath} = this.state
    const {outputs: {selectedNode}} = this.props
    return (
      <Panel>
        <div className={css.container}>
          {Object.keys(nodes).map(key => {
            return (
              <Node
                key={key}
                toggleExpansion={this.toggleNodeExpansionState}
                selectNode={this.selectNode}
                selectedNodePath={selectedNodePath}
                {...nodes[key]}
              />
            )
          })}
        </div>
      </Panel>
    )
  }
}

export default ExplorerPanel
