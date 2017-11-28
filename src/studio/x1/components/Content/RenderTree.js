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
  rootComponentDescriptor: Object,
  rootComponentPath: string[],
}

class RenderTree extends React.PureComponent<Props, void> {
  getLocalHiddenValue = (id: $FixMe): Object => {
    return this.props.rootComponentDescriptor.localHiddenValuesById[id]
  }

  render() {
    const {rootComponentDescriptor, rootComponentPath} = this.props
    return (
      <div className={css.container}>
        <RenderTreeNode
          descriptor={rootComponentDescriptor.whatToRender}
          path={rootComponentPath}
          getLocalHiddenValue={this.getLocalHiddenValue}
        />
      </div>
    )
  }
}

export default connect((s, op) => {
  return {
    rootComponentDescriptor: getComponentDescriptor(s, op.rootComponentId),
    rootComponentPath: getPathToComponentDescriptor(op.rootComponentId),
  }
})(RenderTree)
