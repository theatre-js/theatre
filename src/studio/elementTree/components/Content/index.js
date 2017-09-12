// @flow
import React from 'react'
import generateUniqueID from 'uuid/v4'
import _ from 'lodash'
import Node from './Node'

type State = {
  nodes: Object,
}

class Content extends React.Component {
  state: State
  hook: Object
  rendererID: ?string
  renderRoot: ?Object
  _refMap: Object

  constructor(props: $FlowFixMe) {
    super(props)

    this.hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

    this._setRendererAndRoot()
    this._subscribeToHookEvents()

    this.state = {
      nodes: this._traverseTree(),
    }
  }

  _setRendererAndRoot() {
    let rendererID, renderRoot
    const nativeRoot = document.getElementById('theaterjs-root')
    const {helpers} = this.hook
    for (let key in helpers) {
      const reactRoot = helpers[key].getReactElementFromNative(nativeRoot)
      if (reactRoot !== null) {
        rendererID = key
        renderRoot = reactRoot
        break
      }
    }
    this.rendererID = rendererID
    this.renderRoot = renderRoot
  }

  _subscribeToHookEvents() {
    this.hook.sub('mount', (data) => {
      if (data.renderer !== this.rendererID) return
      this._mountComponent(data.internalInstance)
    })
    this.hook.sub('update', (data) => {
      if (data.renderer !== this.rendererID) return
      this._updateComponent(data)
    })
    this.hook.sub('unmount', (data) => {
      if (data.renderer !== this.rendererID) return
      this._unmountComponent(data.internalInstance)
    })
  }

  _mountComponent(component: Object) {
    if (this._refMap.has(component)) return
    let newComponent = component
    let hostParent = component._hostParent
    while (!this._refMap.has(hostParent)) {
      newComponent = hostParent
      hostParent = hostParent._hostParent
    }
    this.setState((state) => {
      const containerPath = this._refMap.get(hostParent).concat('children')
      const [nodes, refMap] = this._addComponentAndChildren(newComponent, containerPath, state.nodes, this._refMap)
      this._refMap = refMap
      return {nodes}
    })
  }

  _updateComponent(component: Object) {
    if (!this._refMap.has(component)) return
    this.setState((state) => {
      const path = this._refMap.get(component)
      const [nodes, refMap] = this._addNodeData(component, path, state.nodes, this._refMap)
      this._refMap = refMap
      return {nodes}
    })
  }

  _unmountComponent(component: Object) {
    if (this._refMap.has(component)) {
      this.setState((state) => {
        const path = this._refMap.get(component)
        this._refMap.delete(component)
        _.unset(state.nodes, path)
        return {nodes: state.nodes}
      })
    }
  }

  _traverseTree() {
    if (this.renderRoot == null) return {}
    let nodes = {}, refMap = new WeakMap()
    const rootChildren = this._getRenderedSubcomponents(this.renderRoot)
    rootChildren.forEach((rootChild) => {
      [nodes, refMap] = this._addComponentAndChildren(rootChild, [], nodes, refMap)
    })
    this._refMap = refMap
    return nodes
  }

  _addComponentAndChildren(component: Object, containerPath: string[], currentNodes: Object, currentRefMap: Object) {
    let [nodes, refMap, componentPath] = this._addNodeData(component, containerPath, currentNodes, currentRefMap)
    const children = this._getRenderedSubcomponents(component)
    if (children.length > 0) {
      children.forEach((child) => {
        const childPath = componentPath.concat('children');
        [nodes, refMap] = this._addComponentAndChildren(child, childPath, nodes, refMap)
      })
    }
    return [nodes, refMap]
  }

  _addNodeData(component: Object, containerPath: Array<string>, nodes: Object, refMap: Object) {
    const path = (refMap.has(component)) ? containerPath : containerPath.concat(generateUniqueID())
    const data = this._prepareNodeData(component, path)
    _.set(nodes, path, data)
    refMap.set(component, path)
    return [nodes, refMap, path]
  }

  _prepareNodeData(reactObject: Object, path: Array<string>) {
    const {_currentElement: {type}} = reactObject
    return {
      data: {
        name: (typeof type === 'string') ? type : type.name,
      },
      isExpanded: true,
      path,
      _ref: reactObject,
    }
  }

  _getRenderedSubcomponents(component: Object): Array<$FlowFixMe> {
    let children = []
    if (component._renderedChildren != null) {
      children = Object.values(component._renderedChildren)
    }
    if (component._renderedComponent != null) {
      children = [component._renderedComponent]
    }
    return children
  }

  toggleNodeExpansionState = (path: Array<string>) => {
    this.setState((state) => {
      const isExpandedPath = path.concat('isExpanded')
      _.set(state.nodes, isExpandedPath, !_.get(state.nodes, isExpandedPath))
      return {nodes: state.nodes}
    })
  }

  selectNode = (path: Array<string>) => {
    const {children, isExpanded, ...selectedNode} = _.get(this.state.nodes, path)
    this.props.updatePanelOutput({selectedNode})
  }

  render() {
    const {nodes} = this.state
    const {outputs: {selectedNode}} = this.props
    const selectedNodePath = (selectedNode != null) ? selectedNode.path : null
    return (
      <div>
        {
          Object.keys(nodes).map((key) =>
            <Node
              key={key}
              toggleExpansion={this.toggleNodeExpansionState}
              selectNode={this.selectNode}
              selectedNodePath={selectedNodePath}
              {...nodes[key]} />
          )
        }
      </div>
    )
  }
}

export default Content
