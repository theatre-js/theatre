// @flow
import {React, connect} from '$studio/handy'
import {getComponentDescriptor} from '$studio/componentModel/selectors'
import css from './RenderTreeNode.css'

type OwnProps = {
  descriptor: Object,
  path: string[],
  getLocalHiddenValue: Function,
  depth: ?number,
}

type Props = OwnProps & {
  getComponentDescriptor: Function,
}

class RenderTreeNode extends React.PureComponent<Props, void> {
  _getNodeContentAndChildren(descriptor) {
    const {getLocalHiddenValue, getComponentDescriptor} = this.props
    const {__descriptorType: descriptorType, which} = descriptor

    let nodeType = 'tag'
    let nodeContent
    let nodeChildren = []
    if (descriptorType != null) {
      if (descriptorType === 'ReferenceToLocalHiddenValue') {
        const renderDescriptor = getLocalHiddenValue(which)
        if (
          renderDescriptor.__descriptorType ===
          'ComponentInstantiationValueDescriptor'
        ) {
          nodeChildren = [].concat(renderDescriptor.props.children)
          nodeContent = getComponentDescriptor(renderDescriptor.componentId)
            .displayName
        }
      }
    } else {
      nodeType = 'text'
      nodeContent = descriptor
    }

    return {nodeType, nodeContent, nodeChildren}
  }

  render() {
    const {props} = this

    const {
      nodeType,
      nodeContent,
      nodeChildren,
    } = this._getNodeContentAndChildren(props.descriptor)
    const depth = props.depth || 0

    return (
      <div className={css.container} style={{'--depth': depth}}>
        <div className={css.contentContainer}>
          <div className={css.content}>
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
            path={[]}
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

export default WrappedRenderTreeNode
