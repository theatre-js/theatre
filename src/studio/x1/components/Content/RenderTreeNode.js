// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import css from './RenderTreeNode.css'

type OwnProps = {
  descriptor: Object,
  rootPath: string[],
  getLocalHiddenValue: Function,
  depth?: number,
}

type Props = OwnProps & {
  getComponentDescriptor: Function,
  dispatch: Function,
}

class RenderTreeNode extends React.PureComponent<Props, void> {
  _getNodeContentAndChildren(descriptor) {
    const {getLocalHiddenValue, getComponentDescriptor} = this.props
    const {__descriptorType: descriptorType, which} = descriptor

    let nodeType
    let nodePath
    let nodeContent
    let nodeChildren = []
    if (descriptorType != null) {
      nodeType = 'tag'
      if (descriptorType === 'ReferenceToLocalHiddenValue') {
        nodePath = this.props.rootPath.concat('localHiddenValuesById', which)
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

    return {nodeType, nodeContent, nodeChildren, nodePath}
  }

  render() {
    const {props} = this

    const {
      nodeType,
      nodeContent,
      nodeChildren,
      nodePath,
    } = this._getNodeContentAndChildren(props.descriptor)
    const depth = props.depth || 0

    return (
      <div className={css.container} style={{'--depth': depth}}>
        <div className={css.contentContainer}>
          <div
            {...((nodePath != null) ? {onClick: () => props.dispatch(
              reduceStateAction(
                ['x2', 'pathToInspectableInX2'],
                () => nodePath,
              ))} : {})}
            className={css.content}>
            {nodeType === 'tag' ? (
              nodeContent
            ) : (
              <input value={nodeContent} onChange={() => {}} />
            )}
          </div>
        </div>
        {nodeChildren.map((cd, i) => (
          <WrappedRenderTreeNode
            key={i}
            descriptor={cd}
            depth={depth + 1}
            rootPath={props.rootPath}
            getLocalHiddenValue={props.getLocalHiddenValue}
          />
        ))}
      </div>
    )
  }
}

const WrappedRenderTreeNode = connect(s => {
  return {
    getComponentDescriptor: id => getComponentDescriptor(s, id),
  }
})(RenderTreeNode)

export default connect()(WrappedRenderTreeNode)
