// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import css from './RenderTreeNode.css'
import ContextMenu from './ContextMenu'

type OwnProps = {
  descriptor: Object,
  rootPath: string[],
  getLocalHiddenValue: Function,
  addToRefMap: Function,
  moveNode: Function,
  depth?: number,
}

type Props = OwnProps & {
  getComponentDescriptor: Function,
  dispatch: Function,
}

class RenderTreeNode extends React.PureComponent<Props, any> {
  constructor(props) {
    super(props)

    this.state = {
      isContextMenuVisible: false,
    }
  }

  _getNodeContentAndChildren(descriptor) {
    const {getLocalHiddenValue, getComponentDescriptor} = this.props
    const {__descriptorType: descriptorType, which} = descriptor

    let nodeId
    let nodeType
    let nodePath
    let nodeContent
    let nodeChildren = []
    if (descriptorType != null) {
      nodeType = 'tag'
      if (descriptorType === 'ReferenceToLocalHiddenValue') {
        nodePath = this.props.rootPath.concat('localHiddenValuesById', which)
        nodeId = which
        const renderValue = getLocalHiddenValue(which)
        if (
          renderValue.__descriptorType ===
          'ComponentInstantiationValueDescriptor'
        ) {
          nodeChildren = [].concat(renderValue.props.children)
          nodeContent = getComponentDescriptor(renderValue.componentId)
            .displayName
        }
      }
    } else {
      nodeType = 'text'
      nodeContent = descriptor
    }

    return {nodeId, nodeType, nodeContent, nodeChildren, nodePath}
  }

  contextMenuHandler = e => {
    e.preventDefault()
    this._toggleContextMenu()
  }

  _toggleContextMenu() {
    this.setState(state => (
      {isContextMenuVisible: !state.isContextMenuVisible}
    ))
  }

  _moveNode = (id, dir) => {
    this.props.moveNode(id, dir)
    this._toggleContextMenu()
  }

  render() {
    const {props} = this
    const {addToRefMap, getLocalHiddenValue, rootPath, descriptor, dispatch, moveNode} = props

    const {
      nodeId,
      nodeType,
      nodeContent,
      nodeChildren,
      nodePath,
    } = this._getNodeContentAndChildren(descriptor)
    const depth = props.depth || 0

    if (nodeId != null) {
      addToRefMap(nodeId, {noOfChildren: nodeChildren.length})
      nodeChildren.forEach((child, index) => {
        if (child.__descriptorType != null && child.__descriptorType === 'ReferenceToLocalHiddenValue') {
          addToRefMap(child.which, {parent: nodeId, index})
        }
      })
    }

    return (
      <div className={css.container} style={{'--depth': depth}}>
        <div className={css.contentContainer}>
          <div
            {...((nodePath != null)
              ? {
                  onClick: () =>
                    dispatch(
                      reduceStateAction(
                        ['x2', 'pathToInspectableInX2'],
                        () => nodePath,
                      ),
                    ),
                }
              : {})}
            className={css.content}
            onContextMenu={this.contextMenuHandler}
          >
            {nodeType === 'tag' ? (
              nodeContent
            ) : (
              <input value={nodeContent} onChange={() => {}} />
            )}
          </div>
        </div>
        {nodeId && depth !== 0 && this.state.isContextMenuVisible &&
          <ContextMenu
            onMove={dir => this._moveNode(nodeId, dir)}
            depth={depth}/>
        }
        {nodeChildren.map((cd, i) => {
          return (
              <WrappedRenderTreeNode
              key={i}
              descriptor={cd}
              depth={depth + 1}
              rootPath={rootPath}
              getLocalHiddenValue={getLocalHiddenValue}
              addToRefMap={addToRefMap}
              moveNode={moveNode}
            />
          )
        })}
      </div>
    )
  }
}

const WrappedRenderTreeNode = connect(s => {
  return {
    getComponentDescriptor: id => getComponentDescriptor(s, id),
  }
})(RenderTreeNode)

export default WrappedRenderTreeNode
