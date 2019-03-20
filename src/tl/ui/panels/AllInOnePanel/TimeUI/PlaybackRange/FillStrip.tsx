import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './FillStrip.css'
import {val, coldVal} from '$shared/DataVerse/atom'
import {TimeStuffContext} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import HalfPieContextMenu from '$shared/components/HalfPieContextMenu/HalfPieContextMenu'
import {
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import noop from '$shared/utils/noop'
import withContext from '$shared/utils/react/withContext'
import {ITimeStuffP} from '../../TimeStuffProvider'
import {Pointer} from '$shared/DataVerse/pointer'

const stripUnscaledWidth = 1000

const classes = resolveCss(css)

interface IProps {
  timeStuffP: ITimeStuffP
}

interface IState {
  dragging: boolean
  contextMenuOpen: boolean
  contextMenuCoords: {x: number; y: number}
}

export default withContext({
  timeStuffP: TimeStuffContext,
})(
  class FillStrip extends UIComponent<IProps, IState> {
    propsBeforeDrag: IProps
    rangeWhenDragStart: {from: number; to: number}
    deltaXToDeltaTime: (x: number, shouldClamp?: boolean | undefined) => number
    tempActionGroup: ITempActionGroup | undefined
    state = {
      dragging: false,
      contextMenuOpen: false,
      contextMenuCoords: {x: 0, y: 0},
    }

    _render(props: Pointer<IProps>, state: Pointer<IState>) {
      const timeStuffP = this.props.timeStuffP
      const range = val(
        this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
          this.ui.atomP.historic,
          val(timeStuffP.timelineTemplate).address,
        ),
      )

      if (!range) return null

      const viewportWidth = val(timeStuffP.viewportSpace.width)
      const timeToInRangeX = val(
        timeStuffP.viewportScrolledSpace.timeToInRangeX,
      )
      const dragging = val(state.dragging)

      let [fromX, toX] = [timeToInRangeX(range.from), timeToInRangeX(range.to)]

      const invisible = toX < 0 || fromX > viewportWidth
      if (!invisible) {
        if (fromX < 0) fromX = 0
        if (toX > viewportWidth) toX = viewportWidth
      }
      const width = toX - fromX

      const contextMenuOpen = val(state.contextMenuOpen)
      return (
        <>
          {contextMenuOpen && (
            <HalfPieContextMenu
              close={this._closeContextMenu}
              centerPoint={{
                top: this.state.contextMenuCoords.y,
                left: this.state.contextMenuCoords.x,
              }}
              placement="left"
              // renderInPortal={true}
              items={[
                {
                  label: 'Remove playback range',
                  cb: this._deleteLimit,
                },
              ]}
            />
          )}
          <ActiveModeContext.Consumer>
            {activeMode => {
              const dIsDown = activeMode === MODES.d
              return (
                <DraggableArea
                  onDragStart={this.onDragStart}
                  onDragEnd={this.onDragEnd}
                  onDrag={this.onDrag}
                  lockCursorTo="ew-resize"
                >
                  <div
                    {...classes(
                      'container',
                      invisible && 'invisible',
                      dIsDown && 'dIsDown',
                      dragging && 'dragging',
                      contextMenuOpen && 'contextMenuOpen',
                    )}
                    style={{
                      transform: `translateX(${fromX}px) scaleX(${width /
                        stripUnscaledWidth})`,
                    }}
                    onContextMenu={this._openContextMenu}
                    onClick={(dIsDown && this._deleteLimit) || noop}
                  />
                </DraggableArea>
              )
            }}
          </ActiveModeContext.Consumer>
        </>
      )
    }

    onDragStart = () => {
      const timelineTemplate = coldVal(this.props.timeStuffP.timelineTemplate)
      const range = val(
        this.ui._selectors.historic.getTemporaryPlaybackRangeLimit(
          this.ui.atomP.historic,
          timelineTemplate.address,
        ),
      )
      if (!range) {
        // shouldn't even happen
        return
      }

      this.deltaXToDeltaTime = coldVal(
        this.props.timeStuffP.viewportScrolledSpace.deltaXToDeltaTime,
      )
      this.propsBeforeDrag = this.props
      this.rangeWhenDragStart = range
      this.tempActionGroup = this.ui.actions.historic.temp()
      this.setState({dragging: true})
    }

    onDrag = (dx: number) => {
      const timeDiff = this.deltaXToDeltaTime(dx, false)

      const clampTime = coldVal(this.props.timeStuffP.timeSpace.clamp)

      const [from, to] = [
        this.rangeWhenDragStart.from + timeDiff,
        this.rangeWhenDragStart.to + timeDiff,
      ].map(clampTime)

      this.ui._dispatch(
        this.tempActionGroup!.push(
          this.ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
            limit: {from, to},
            ...coldVal(this.props.timeStuffP.timelineTemplate.address),
          }),
        ),
      )
    }

    onDragEnd = (happened: boolean) => {
      this.setState({dragging: false})
      const tempActionGroup = this.tempActionGroup!
      this.ui._dispatch(
        happened ? tempActionGroup.commit() : tempActionGroup.discard(),
      )
      this.tempActionGroup = undefined
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

    _deleteLimit = () => {
      this._closeContextMenu()
      this.ui._dispatch(
        this.ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
          limit: undefined,
          ...coldVal(this.props.timeStuffP.timelineTemplate.address),
        }),
      )
    }

    _fitToViewport = () => {
      this._closeContextMenu()
    }
  },
)
