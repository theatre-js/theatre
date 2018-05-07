import React from 'react'
import css from './Header.css'
import resolveCss from '$shared/utils/resolveCss'
import SceneSelector from '$theater/workspace/components/WhatToShowInBody/Viewports/SceneSelector'
import HalfPieContextMenu from '$theater/common/components/HalfPieContextMenu'
import MdCancel from 'react-icons/lib/md/cancel'
import MdDonutSmall from 'react-icons/lib/md/donut-small'
import MdStars from 'react-icons/lib/md/stars'

const classes = resolveCss(css)

interface IProps {
  name: string
  viewportId: string
  width: number
  height: number
  isActive: boolean
  deleteViewport: (viewportId: string) => any
  activateViewport: () => any
}

interface IState {
  isEditingName: boolean
  isEditingSize: boolean
  contextMenuProps:
    | undefined
    | null
    | {
        left: number
        top: number
      }
}

class SceneHeader extends React.PureComponent<IProps, IState> {
  state = {
    isEditingName: false,
    isEditingSize: false,
    contextMenuProps: null,
  }

  enableEditingName = () => {
    this.setState(() => ({isEditingName: true}))
  }

  disableEditingName = () => {
    this.setState(() => ({isEditingName: false}))
  }

  showContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.setState(() => ({contextMenuProps: {left: clientX, top: clientY}}))
  }

  deleteViewport = () => {
    this.props.deleteViewport(this.props.viewportId)
  }

  render() {
    const {isEditingName, contextMenuProps} = this.state
    const {name, isActive, activateViewport} = this.props
    return (
      <>
        <div
          {...classes('container', isActive && 'isActive')}
          onClick={activateViewport}
          onContextMenu={this.showContextMenu}
        >
          <div
            {...classes('nameContainer', isEditingName && 'isEnabled')}
            onClick={this.enableEditingName}
          >
            {isEditingName ? (
              <SceneSelector
                viewportId={this.props.viewportId}
                onSelect={this.disableEditingName}
                onCancel={this.disableEditingName}
              />
            ) : (
              <span {...classes('name')}>{name}</span>
            )}
          </div>
          <span {...classes('separator')}>–</span>
          <span {...classes('dimensions')}>
            {this.props.width}x{this.props.height}
          </span>
        </div>
        {contextMenuProps != null && (
          <HalfPieContextMenu
            close={() => this.setState(() => ({contextMenuProps: null}))}
            centerPoint={contextMenuProps}
            placement="top"
            items={[
              {
                label: '$D$elete Viewport',
                cb: this.deleteViewport,
                IconComponent: MdCancel,
              },
              {
                label: 'Duplicate $V$iewport',
                cb: () => null,
                IconComponent: MdStars,
              },
              {
                label: '$C$lone Scene',
                cb: () => null,
                IconComponent: MdDonutSmall,
              },
            ]}
          />
        )}
      </>
    )
  }
}

export default SceneHeader
