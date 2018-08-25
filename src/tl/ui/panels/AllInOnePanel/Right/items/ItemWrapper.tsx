import React from 'react'
import UIComponent from '$tl/ui/handy/UIComponent'
import css from './ItemWrapper.css'
import {resolveCss} from '$shared/utils'
import {
  PrimitivePropItem,
  singleItemHeight,
} from '$tl/ui/panels/AllInOnePanel/utils'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'

const classes = resolveCss(css)

interface IProps {
  item: PrimitivePropItem
}

interface IState {}

class ItemWrapper extends UIComponent<IProps, IState> {
  tempActionGroup = this.ui.actions.historic.temp()

  render() {
    const {height, top, expanded} = this.props.item
    return (
      <div
        {...classes('container')}
        onDoubleClick={this.toggleExpansion}
        style={{top, height}}
      >
        {this.props.children}
        {expanded && (
          <DraggableArea
            onDrag={this.handleResize}
            onDragEnd={this.handleResizeEnd}
            shouldReturnMovement={true}
          >
            <div {...classes('resizeHandle')} />
          </DraggableArea>
        )}
      </div>
    )
  }

  toggleExpansion = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setPropExpansion({
        expanded: !this.props.item.expanded,
        ...this.props.item.address,
      }),
    )
  }

  handleResize = (_: number, dy: number) => {
    const newHeight = Math.max(this.props.item.height + dy, singleItemHeight)
    this.ui.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.ui.actions.historic.setPropHeightWhenExpanded({
          ...this.props.item.address,
          height: newHeight,
        }),
      ),
    )
  }

  handleResizeEnd = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.batched([
        this.ui.actions.historic.setPropHeightWhenExpanded({
          ...this.props.item.address,
          height: this.props.item.height,
        }),
        this.tempActionGroup.discard(),
      ]),
    )
  }
}

export default ItemWrapper
