import React from 'react'
import css from './FocusSelector.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  timeToX,
  xToTime,
  getRangeLabel,
  timeToTimelineX,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {getNewRange} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {SVG_PADDING_X} from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import UIComponent from '$tl/ui/handy/UIComponent'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import atom, {val, Atom} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import {Pointer} from '$shared/DataVerse2/pointer'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'

const classes = resolveCss(css)

interface IProps {
  duration: TDuration
  range: TRange
  timelineWidth: number
  setRange: (range: TRange) => void
  timelineInstance: TimelineInstance
  tempRangeLimit: undefined | {from: number, to: number}
}

interface IState {
  contextMenuOpen: boolean
  contextMenuCoords: {x: number; y: number}
}

class FocusSelector extends UIComponent<IProps, IState> {
  _propsBeforeMove: IProps = this.props
  state = {contextMenuOpen: false, contextMenuCoords: {x: 0, y: 0}}

  render() {
    const {range: _range, duration, timelineWidth, tempRangeLimit} = this.props
    const range = tempRangeLimit || {from: 0, to: duration}
    const tToX = timeToTimelineX(_range, timelineWidth - SVG_PADDING_X)
    const getLabel = getRangeLabel(range, duration, timelineWidth)
    let rangeFromX = tToX(range.from)
    let rangeToX = tToX(range.to)
    const fromIsHidden = rangeFromX <= 0
    const toIsHidden = rangeToX > timelineWidth - 14

    if (fromIsHidden) rangeFromX = -7
    if (toIsHidden) rangeToX = timelineWidth - 7

    return (
      <>
        {this.state.contextMenuOpen && (
          <HalfPieContextMenu
            close={this._closeContextMenu}
            centerPoint={{
              top: this.state.contextMenuCoords.y,
              left: this.state.contextMenuCoords.x,
            }}
            placement="top"
            renderInPortal={true}
            items={[
              {
                label: '$D$elete limit',
                IconComponent: () => '',
                cb: this._deleteLimit,
              },
            ]}
          />
        )}
        <div {...classes('container')}>
          <div {...classes('timeThread')}>
            <DraggableArea
              onDragStart={this._recordPropsBeforeMove}
              onDrag={this.updateRange}
              lockCursorTo="ew-resize"
            >
              <div
                {...classes(
                  'rangeBar',
                  this.state.contextMenuOpen && 'contextMenuOpen',
                )}
                onContextMenu={this._openContextMenu}
                style={{
                  width: `${rangeToX - rangeFromX}px`,
                  transform: `translate3d(${rangeFromX}px, 0, 0)`,
                }}
              />
            </DraggableArea>
            <DraggableArea
              onDrag={this.updateRangeFrom}
              lockCursorTo="w-resize"
              onDragStart={this._recordPropsBeforeMove}
            >
              <div
                {...classes('rangeFromHandle', fromIsHidden && 'hidden')}
                style={{transform: `translate3d(${rangeFromX}px, 0, 0)`}}
              >
                <div {...classes('tooltip')}>{getLabel(range.from)}</div>
              </div>
            </DraggableArea>
            <DraggableArea
              onDrag={this.updateRangeTo}
              lockCursorTo="e-resize"
              onDragStart={this._recordPropsBeforeMove}
            >
              <div
                {...classes('rangeToHandle', toIsHidden && 'hidden')}
                style={{transform: `translate3d(${rangeToX}px, 0, 0)`}}
              >
                <div {...classes('tooltip')}>{getLabel(range.to)}</div>
              </div>
            </DraggableArea>
          </div>
        </div>
      </>
    )
  }

  _deleteLimit = () => {
    this._closeContextMenu()
    this.ui._dispatch(
      this.ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
        ...this.props.timelineInstance._timelineTemplate.address,
        limit: undefined,
      }),
    )
  }

  _openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      contextMenuOpen: true,
      contextMenuCoords: {x: e.clientX, y: e.clientY},
    })
  }

  _closeContextMenu = () => {
    this.setState({contextMenuOpen: false})
  }

  _recordPropsBeforeMove = () => {
    this._propsBeforeMove = this.props
  }

  updateRange = (dx: number) => {
    return
    const {duration, timelineWidth} = this._propsBeforeMove
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: dt, to: dt}, true)
  }

  updateRangeFrom = (dx: number) => {
    return
    const {duration, timelineWidth} = this._propsBeforeMove
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: dt, to: 0}, false)
  }

  updateRangeTo = (dx: number) => {
    return
    const {duration, timelineWidth} = this._propsBeforeMove
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: 0, to: dt}, false)
  }

  _setRange(change: TRange, bringRangeToBackIfRangeFromIsSubzero: boolean) {
    const {range, duration, setRange} = this._propsBeforeMove
    setRange(
      getNewRange(
        range,
        change,
        duration,
        bringRangeToBackIfRangeFromIsSubzero,
      ),
    )
  }
}

const FocusSelectorWrapper = (
  props: Pick<IProps, Exclude<keyof IProps, 'timelineInstance' | 'tempRangeLimit'>>,
) => {
  return (
    <AllInOnePanelStuff>
      {stuffP => {
        return (
          <PropsAsPointer props={props}>
            {({props: propsP}) => {
              const ui = val(stuffP.ui)
              const timelineInstance = val(stuffP.timelineInstance)
              if (!timelineInstance) return null
              const tempRangeLimit = val(
                ui._selectors.historic.getTemporaryPlaybackRangeLimit(
                  ui.atomP.historic,
                  timelineInstance._address,
                ),
              )
              return (
                <FocusSelector
                  {...val(propsP)}
                  timelineInstance={timelineInstance}
                  tempRangeLimit={tempRangeLimit}
                />
              )
            }}
          </PropsAsPointer>
        )
      }}
    </AllInOnePanelStuff>
  )
}

export default FocusSelectorWrapper
