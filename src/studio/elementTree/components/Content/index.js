// @flow
import React from 'react'
import generateUniqueID from 'uuid/v4'
import _ from 'lodash'
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
  // hook: Object
  rendererID: ?string
  // renderRoot: ?Object
  _refMap: Object

  constructor(props: Props) {
    super(props)

    // this.hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

    // this._setRendererAndRoot()
    this._subscribeToHookEvents(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

    // this.state = {
    //   nodes: this._traverseTree(),
    // }
    this.state = {nodes: {}}
    this._refMap = new WeakMap()
  }

  // _setRendererAndRoot() {
  //   let rendererID, renderRoot
  //   const nativeRoot = document.getElementById('theaterjs-root')
  //   const {_renderers: renderers} = this.hook
  //   for (let key in renderers) {
  //     const reactRoot = renderers[key].ComponentTree.getClosestInstanceFromNode(
  //       nativeRoot,
  //     )
  //     if (reactRoot !== null) {
  //       rendererID = key
  //       renderRoot = reactRoot
  //       break
  //     }
  //   }
  //   this.rendererID = rendererID
  //   this.renderRoot = renderRoot
  // }

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
        // this._traverseTree(root)
      }
    })
    hook.sub('mount', data => {
      if (data.renderer !== this.rendererID) return
      this._mountNode(data.internalInstance)
    })
    // hook.sub('update', data => {
    //   if (data.renderer !== this.rendererID) return
    //   this._updateComponent(data)
    // })
    // hook.sub('unmount', data => {
    //   if (data.renderer !== this.rendererID) return
    //   this._unmountComponent(data.internalInstance)
    // })
  }

  _mountNode(node: Object) {
    let root = node
    while (!this._refMap.has(root)) {
      if (root.return == null) return
      if (
        root.return.key ===
        'TheaterJS/Core/RenderCurrentCanvas#RenderCurrentCanvas'
      ) {
        break
      }
      root = root.return
    }
    if (root === node) return

    this.setState(state => {
      const containerPath = this._refMap.get(root.return)
        ? this._refMap.get(root.return).concat('children')
        : []
      const [nodes, refMap] = this._addNodeAndChildren(
        root,
        containerPath,
        state.nodes,
      )
      this._refMap = refMap
      return {nodes}
    })

    // if (this._refMap.has(component)) return
    // let newComponent = component
    // let hostParent = component._hostParent
    // while (!this._refMap.has(hostParent)) {
    //   newComponent = hostParent
    //   hostParent = hostParent._hostParent
    // }
    // this.setState(state => {
    //   const containerPath = this._refMap.get(hostParent).concat('children')
    //   const [nodes, refMap] = this._addComponentAndChildren(
    //     newComponent,
    //     containerPath,
    //     state.nodes,
    //     this._refMap,
    //   )
    //   this._refMap = refMap
    //   return {nodes}
    // })
  }

  _addNodeAndChildren(
    root: Object,
    containerPath: string[],
    currentNodes: Object,
  ) {
    let nodes = currentNodes
    let refMap = this._refMap
    let node = root
    let nodePath = containerPath
    while (true) {
      ;[nodes, refMap, nodePath] = this._addNodeData(
        node,
        nodePath,
        nodes,
        refMap,
      )

      if (node.child) {
        node = node.child
        nodePath = nodePath.concat('children')
        continue
      }
      if (node === root) {
        return [nodes, refMap]
      }
      while (!node.sibling) {
        if (!node.return || node.return === root) {
          return [nodes, refMap]
        }
        node = node.return
        nodePath = nodePath.slice(0, -3)
      }
      node = node.sibling
    }
  }

  _updateComponent(component: Object) {
    if (!this._refMap.has(component)) return
    this.setState(state => {
      const path = this._refMap.get(component)
      const [nodes, refMap] = this._addNodeData(
        component,
        path,
        state.nodes,
        this._refMap,
      )
      this._refMap = refMap
      return {nodes}
    })
  }

  _unmountComponent(component: Object) {
    if (this._refMap.has(component)) {
      this.setState(state => {
        const path = this._refMap.get(component)
        this._refMap.delete(component)
        _.unset(state.nodes, path)
        return {nodes: state.nodes}
      })
    }
  }

  // _traverseTree(root: Object) {
  // if (this.renderRoot == null) return {}
  // let nodes = {},
  //   refMap = new WeakMap()
  // const rootChildren = this._getRenderedSubcomponents(this.renderRoot)
  // rootChildren.forEach(rootChild => {
  //   ;[nodes, refMap] = this._addComponentAndChildren(
  //     rootChild,
  //     [],
  //     nodes,
  //     refMap,
  //   )
  // })
  // this._refMap = refMap
  // return nodes
  // }

  _addComponentAndChildren(
    component: Object,
    containerPath: string[],
    currentNodes: Object,
    currentRefMap: Object,
  ) {
    let [nodes, refMap, componentPath] = this._addNodeData(
      component,
      containerPath,
      currentNodes,
      currentRefMap,
    )
    const children = this._getRenderedSubcomponents(component)
    if (children.length > 0) {
      children.forEach(child => {
        const childPath = componentPath.concat('children')
        ;[nodes, refMap] = this._addComponentAndChildren(
          child,
          childPath,
          nodes,
          refMap,
        )
      })
    }
    return [nodes, refMap]
  }

  _addNodeData(
    component: Object,
    containerPath: Path,
    nodes: Object,
    refMap: Object,
  ) {
    const path = refMap.has(component)
      ? containerPath
      : containerPath.concat(generateUniqueID())
    const data = this._prepareNodeData(component, path)
    _.set(nodes, path, data)
    refMap.set(component, path)
    return [nodes, refMap, path]
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

  _getRenderedSubcomponents(component: Object): Array<$FixMe> {
    let children = []
    if (component._renderedChildren != null) {
      children = Object.values(component._renderedChildren)
    }
    if (component._renderedComponent != null) {
      children = [component._renderedComponent]
    }
    return children
  }

  toggleNodeExpansionState = (path: Path) => {
    this.setState(state => {
      const isExpandedPath = path.concat('isExpanded')
      _.set(state.nodes, isExpandedPath, !_.get(state.nodes, isExpandedPath))
      return {nodes: state.nodes}
    })
  }

  selectNode = (path: Path) => {
    const {children, isExpanded, ...selectedNode} = _.get(
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
