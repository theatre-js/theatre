// @flow
import {React, connect} from '$studio/handy'
import {
  getComponentDescriptor,
  getPathToComponentDescriptor,
} from '$studio/componentModel/selectors'
import css from './RenderTree.css'
import RenderTreeNode from './RenderTreeNode'

type OwnProps = {
  rootComponentId: string,
}

type Props = OwnProps & {
  rootDescriptor: Object,
  rootPath: string[],
}

class RenderTree extends React.PureComponent<Props, void> {
  getLocalHiddenValue = (id: $FixMe): Object => {
    return this.props.rootDescriptor.localHiddenValuesById[id]
  }

  render() {
    const {rootDescriptor, rootPath} = this.props
    return (
      <div className={css.container}>
        <RenderTreeNode
          descriptor={rootDescriptor.whatToRender}
          rootPath={rootPath}
          getLocalHiddenValue={this.getLocalHiddenValue}
        />
      </div>
    )
  }
}

export default connect((s, op) => {
  return {
    rootDescriptor: getComponentDescriptor(s, op.rootComponentId),
    rootPath: getPathToComponentDescriptor(op.rootComponentId),
  }
})(RenderTree)
