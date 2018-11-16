import React from 'react'
import UIComponent from '$tl/ui/handy/UIComponent'
import css from './ItemWrapper.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  PrimitivePropItem,
  singleItemHeight,
} from '$tl/ui/panels/AllInOnePanel/utils'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'

const classes = resolveCss(css)

interface IProps {
  item: PrimitivePropItem
  sticky: boolean
  type: 'static' | 'bezierCurves'
}

interface IState {}

class ItemWrapper extends UIComponent<IProps, IState> {
  tempActionGroup = this.ui.actions.historic.temp()
  propsBeforeResize: IProps

  render() {
    const {height, top, expanded} = this.props.item
    return (
      <div
        {...classes(
          'container',
          this.props.sticky && 'sticky',
          this.props.type,
        )}
        // onDoubleClick={this.toggleExpansion}
        style={{top, height}}
      >
        {this.props.children}
        {this.props.item.expandable && (
          <DraggableArea
            onDragStart={this.handleResizeStart}
            onDrag={this.handleResize}
            onDragEnd={this.handleResizeEnd}
            // shouldReturnMovement={false}
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

  handleResizeStart = () => {
    this.tempActionGroup = this.ui.actions.historic.temp()
    this.propsBeforeResize = this.props
  }

  handleResize = (_: number, dy: number) => {
    const oldHeight = this.propsBeforeResize.item.height
    const newHeight = Math.max(oldHeight + dy, singleItemHeight)

    this.ui.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.ui.actions.historic.setPropExpansionAndHeight({
          ...this.propsBeforeResize.item.address,
          expanded: newHeight !== singleItemHeight,
          height: newHeight,
        }),
      ),
    )
  }

  handleResizeEnd = () => {
    this.ui.reduxStore.dispatch(this.tempActionGroup.commit())
    this.tempActionGroup = this.ui.actions.historic.temp()
  }
}

export default ItemWrapper
