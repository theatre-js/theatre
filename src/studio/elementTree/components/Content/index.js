// @flow
import * as React from 'react'
import generateUniqueID from 'uuid/v4'
import {get} from 'lodash'
import {set} from 'lodash/fp'
import type {PanelOutput} from '$studio/workspace/types'
import type {Path} from '$studio/elementTree/types'
import css from './index.css'
import Node from './Node'

type Props = {
  outputs: PanelOutput,
  updatePanelOutput: Function,
}

type State = {
  nodes: Object,
}

class ElementTreePanelContent extends React.PureComponent<Props, State> {
  rendererID: ?string
  _refMap: Object

  constructor(props: Props) {
    super(props)

    this._subscribeToHookEvents(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

    this._refMap = new WeakMap()
    this.state = {nodes: {}}
    this.rendererID = undefined
    this.updateTimeout = null
  }

  _subscribeToHookEvents(hook: ?Object) {
    if (hook == null) throw Error('Dev tools hook not found!')
    hook.sub('renderer', ({id}) => {
      this.rendererID = id
      this.debouncedAddNodes(hook)
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
      if (node.key === 'TheaterJS/Core/RenderCurrentCanvas#RenderCurrentCanvas') {
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
        
        path = path.concat(generateUniqueID())
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

  // _mountNode(node: Object) {
  //   if (this._refMap.has(node)) return

  //   let root = node
  //   while (!this._refMap.has(root.return)) {
  //     if (root.return == null) return
  //     if (root.return.key === 'TheaterJS/Core/RenderCurrentCanvas#RenderCurrentCanvas') {
  //       break
  //     }
  //     root = root.return
  //   }

  //   this.setState(state => {
  //     const containerPath = this._refMap.get(root.return)
  //       ? this._refMap.get(root.return).concat('children')
  //       : []
  //     const {nodes, refMap} = this._addNodeAndChildren(root, containerPath, state.nodes)
  //     this._refMap = refMap
  //     return {nodes}
  //   })
  // }

  // _addNodeAndChildren(root: Object, containerPath: Path, currentNodes: Object) {
  //   let node = root
  //   let nodePath = containerPath
  //   let nodes = currentNodes
  //   let refMap = this._refMap
  //   // eslint-disable-next-line no-constant-condition
  //   outer: while (true) {
  //     ;({nodes, refMap, path: nodePath} = this._addNodeData(
  //       node,
  //       nodePath,
  //       nodes,
  //       refMap,
  //     ))

  //     if (node.child) {
  //       node = node.child
  //       nodePath = nodePath.concat('children')
  //       continue
  //     }

  //     if (node === root) break

  //     while (!node.sibling) {
  //       if (!node.return || node.return === root) {
  //         break outer
  //       }
  //       node = node.return
  //       nodePath = nodePath.slice(0, -3)
  //     }
  //     node = node.sibling
  //   }

  //   return {nodes, refMap}
  // }

  // _updateNode(node: Object) {
  //   if (!this._refMap.has(node)) return
  //   this.setState(state => {
  //     const path = this._refMap.get(node)
  //     const {nodes, refMap} = this._addNodeData(node, path, state.nodes, this._refMap)
  //     this._refMap = refMap
  //     return {nodes}
  //   })
  // }

  // _unmountNode(node: Object) {
  //   if (this._refMap.has(node)) {
  //     this.setState(state => {
  //       const path = this._refMap.get(node)
  //       this._refMap.delete(node)
  //       const modifiedNodes = unset(path, state.nodes)
  //       return {nodes: modifiedNodes}
  //     })
  //   }
  // }

  _addNodeData(node: Object, path: Path, originalNodes: Object, refMap: Object) {
    const data = this._prepareNodeData(node, path)
    const modifiedNodes = set(path, data, originalNodes)
    refMap.set(node, path)
    return {nodes: modifiedNodes, refMap, path}
  }

  _prepareNodeData(reactObject: Object, path: Path) {
    const {stateNode} = reactObject
    return {
      data: {
        componentId: stateNode.getComponentId ? stateNode.getComponentId() : null,
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

  selectNode = (path: Path) => {
    const {data: selectedNode} = get(this.state.nodes, path)
    this.props.updatePanelOutput({selectedNode})
  }

  render() {
    const {nodes} = this.state
    const {outputs: {selectedNode}} = this.props
    const selectedNodePath = selectedNode != null ? selectedNode.path : null
    return (
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
    )
  }
}

export default ElementTreePanelContent
