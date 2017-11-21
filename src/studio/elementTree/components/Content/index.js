// @flow
import React from 'react'
import generateUniqueID from 'uuid/v4'
import {set, unset, get} from 'lodash'
import Node from './Node'
import {type PanelOutput} from '$studio/workspace/types'
import {type Path} from '$studio/elementTree/types'

type Props = {
  outputs: PanelOutput,
  updatePanelOutput: Function,
}

type State = {
  nodes: Object,
}

class Content extends React.Component<Props, State> {
  rendererID: ?string
  _refMap: Object

  constructor(props: Props) {
    super(props)

    this._subscribeToHookEvents(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

    this._refMap = new WeakMap()
    this.state = {nodes: {}}
  }

  _subscribeToHookEvents(hook: ?Object) {
    if (hook == null) throw Error('Dev tools hook not found!')

    hook.sub('renderer-attached', ({id}) => {
      // $FixMe
      const root = hook
        .getFiberRoots(id)
        .values()
        .next().value
      if (root.containerInfo.id !== 'theaterjs-studio') {
        this.rendererID = id
      }
    })
    hook.sub('mount', data => {
      if (data.renderer !== this.rendererID) return
      this._mountNode(data.internalInstance)
    })
    hook.sub('update', data => {
      if (data.renderer !== this.rendererID) return
      this._updateNode(data.internalInstance)
    })
    hook.sub('unmount', data => {
      if (data.renderer !== this.rendererID) return
      this._unmountNode(data.internalInstance)
    })
  }

  _mountNode(node: Object) {
    if (this._refMap.has(node)) return

    let root = node
    while (!this._refMap.has(root.return)) {
      if (root.return == null) return
      if (
        root.return.key ===
        'TheaterJS/Core/RenderCurrentCanvas#RenderCurrentCanvas'
      ) {
        break
      }
      root = root.return
    }

    this.setState(state => {
      const containerPath = this._refMap.get(root.return)
        ? this._refMap.get(root.return).concat('children')
        : []
      const {nodes, refMap} = this._addNodeAndChildren(
        root,
        containerPath,
        state.nodes,
      )
      this._refMap = refMap
      return {nodes}
    })
  }

  _addNodeAndChildren(root: Object, containerPath: Path, currentNodes: Object) {
    let node = root
    let nodePath = containerPath
    let nodes = currentNodes
    let refMap = this._refMap
    // eslint-disable-next-line no-constant-condition
    outer: while (true) {
      ;({nodes, refMap, path: nodePath} = this._addNodeData(
        node,
        nodePath,
        nodes,
        refMap,
      ))

      if (node.child) {
        node = node.child
        nodePath = nodePath.concat('children')
        continue
      }

      if (node === root) break

      while (!node.sibling) {
        if (!node.return || node.return === root) {
          break outer
        }
        node = node.return
        nodePath = nodePath.slice(0, -3)
      }
      node = node.sibling
    }

    return {nodes, refMap}
  }

  _updateNode(node: Object) {
    if (!this._refMap.has(node)) return
    this.setState(state => {
      const path = this._refMap.get(node)
      const {nodes, refMap} = this._addNodeData(
        node,
        path,
        state.nodes,
        this._refMap,
      )
      this._refMap = refMap
      return {nodes}
    })
  }

  _unmountNode(node: Object) {
    if (this._refMap.has(node)) {
      this.setState(state => {
        const path = this._refMap.get(node)
        this._refMap.delete(node)
        unset(state.nodes, path)
        return {nodes: state.nodes}
      })
    }
  }

  _addNodeData(
    node: Object,
    containerPath: Path,
    nodes: Object,
    refMap: Object,
  ) {
    const path = containerPath.concat(generateUniqueID())
    const data = this._prepareNodeData(node, path)
    set(nodes, path, data)
    refMap.set(node, path)
    return {nodes, refMap, path}
  }

  _prepareNodeData(reactObject: Object, path: Path) {
    const {type} = reactObject
    return {
      data: {
        name: typeof type === 'string' ? type : type.displayName,
      },
      isExpanded: true,
      path,
      _ref: reactObject,
    }
  }

  toggleNodeExpansionState = (path: Path) => {
    this.setState(state => {
      const isExpandedPath = path.concat('isExpanded')
      set(state.nodes, isExpandedPath, !get(state.nodes, isExpandedPath))
      return {nodes: state.nodes}
    })
  }

  selectNode = (path: Path) => {
    const {children, isExpanded, ...selectedNode} = get(
      this.state.nodes,
      path,
    )
    this.props.updatePanelOutput({selectedNode})
  }

  render() {
    const {nodes} = this.state
    const {outputs: {selectedNode}} = this.props
    const selectedNodePath = selectedNode != null ? selectedNode.path : null
    return (
      <div>
        {Object.keys(nodes).map(key => (
          <Node
            key={key}
            toggleExpansion={this.toggleNodeExpansionState}
            selectNode={this.selectNode}
            selectedNodePath={selectedNodePath}
            {...nodes[key]}
          />
        ))}
      </div>
    )
  }
}

export default Content
