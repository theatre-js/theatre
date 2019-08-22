import React from 'react'
import {
  IItems,
  MenuAPIContext,
} from '$shared/components/MultiLevelDropdown/MultiLevelDropdown'
import css from './InternalItem.css'
import resolveCss from '$shared/utils/resolveCss'
import ItemsList from '$shared/components/MultiLevelDropdown/ItemsList'
import {
  isInsideTriangle,
  getDistance2,
} from '$shared/components/MultiLevelDropdown/utils'
import OverlaySection from '$shared/components/Overlay/OverlaySection'

const classes = resolveCss(css)

interface IProps {
  title: string
  path: string[]
  isSelectable: boolean
  subItems: IItems
  activePath: string[]
  isActive: boolean
}

interface IState {
  renderExtender: boolean
  menuHeight: number
}

class InternalItem extends React.PureComponent<IProps, IState> {
  extender: React.RefObject<HTMLDivElement> = React.createRef()
  menuWrapper: React.RefObject<HTMLDivElement> = React.createRef()
  hideExtenderTimeout: NodeJS.Timer
  menuTopLeftEdge: [number, number]
  menuBottomLeftEdge: [number, number]
  mouseCoords: null | [number, number] = null

  state = {
    renderExtender: false,
    menuHeight: 0,
  }

  render() {
    return (
      <div {...classes('container')}>
        {this.state.renderExtender && this._renderExtender()}
        {this._renderItem()}
        {this._renderMenu()}
      </div>
    )
  }

  _renderExtender() {
    return (
      <div
        {...classes('extender')}
        //@ts-ignore
        style={{'--height': this.state.menuHeight}}
        ref={this.extender}
        onMouseLeave={this.hideExtender}
        onMouseEnter={this.showExtender}
        onMouseMoveCapture={this.handleExtenderMouseMove}
      />
    )
  }

  _renderItem() {
    const {title, path, isSelectable, isActive} = this.props
    return (
      <MenuAPIContext.Consumer>
        {api => {
          const onSelect = () => (isSelectable ? api.onSelect(path) : null)
          return (
            <div
              {...classes(
                'item',
                isActive && 'active',
                isSelectable && 'selectable',
              )}
              onMouseMove={this.handleItemMouseEnter}
              onMouseLeave={this.handleItemMouseLeave}
              onClickCapture={onSelect}
            >
              <span {...classes('title')}>{title}</span>
              <span {...classes('arrow')}>&rsaquo;</span>
            </div>
          )
        }}
      </MenuAPIContext.Consumer>
    )
  }

  _renderMenu() {
    const {subItems, activePath} = this.props
    return (
      <OverlaySection {...classes('subMenu')}>
        <div ref={this.menuWrapper}>
          <ItemsList items={subItems} activePath={activePath} />
        </div>
      </OverlaySection>
    )
  }

  handleItemMouseEnter = () => {
    if (this.state.renderExtender) return
    const menuRect = this.menuWrapper.current!.getBoundingClientRect()
    this.menuTopLeftEdge = [menuRect.left, menuRect.top]
    this.menuBottomLeftEdge = [menuRect.left, menuRect.bottom]
    this.setState(() => ({
      renderExtender: true,
      menuHeight: menuRect.height,
    }))
  }

  handleItemMouseLeave = () => {
    this.hideExtenderTimeout = setTimeout(this.hideExtender, 0)
  }

  showExtender = () => {
    clearTimeout(this.hideExtenderTimeout)
    this.mouseCoords = null
    this.setState(({renderExtender}) =>
      renderExtender ? null : {renderExtender: true},
    )
  }

  hideExtender = () => {
    this.setState(() => ({renderExtender: false}))
  }

  handleExtenderMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const {clientX, clientY} = event
    const currentMouseCoords: [number, number] = [clientX, clientY]
    if (this.mouseCoords == null) {
      this.mouseCoords = currentMouseCoords
      return
    }

    if (getDistance2(this.mouseCoords, currentMouseCoords) > 10) {
      if (
        !isInsideTriangle(
          currentMouseCoords,
          this.mouseCoords,
          this.menuTopLeftEdge,
          this.menuBottomLeftEdge,
        )
      ) {
        this.setState(() => ({renderExtender: false}))
      }
      this.mouseCoords = currentMouseCoords
    }
  }
}

export default InternalItem
