import resolveCss from '$shared/utils/resolveCss'
import React, {useRef} from 'react'
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
import {useContext, useState} from 'react'
import {autoDeriveElement} from '$shared/DataVerse/utils/react'
import {UIContext} from '$tl/ui/UI'

const stripUnscaledWidth = 1000

const classes = resolveCss(css)

const initialContextMenuCoords = {x: 0, y: 0}

const FillStrip = () => {
  const timeStuffP = useContext(TimeStuffContext)
  const ui = useContext(UIContext)
  const [dragging, setDragging] = useState(false)
  const [contextMenuOpen, setContextMenuOpenState] = useState(false)
  const activeMode = useContext(ActiveModeContext)
  const dIsDown = activeMode === MODES.d
  const [contextMenuCoords, setContextMenuCoords] = useState<{
    x: number
    y: number
  }>(initialContextMenuCoords)
  const refStuff = useRef<{
    rangeWhenDragStart?: {from: number; to: number}
    deltaXToDeltaTime?: (x: number, shouldClamp?: boolean | undefined) => number
    tempActionGroup?: ITempActionGroup | undefined
  }>({})

  const deltaXToDeltaTime = useRef<$FixMe>(null)

  const closeContextMenu = () => {
    setContextMenuOpenState(false)
  }

  const deleteLimit = () => {
    closeContextMenu()
    ui._dispatch(
      ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
        limit: undefined,
        ...coldVal(timeStuffP.timelineTemplate.address),
      }),
    )
  }

  const onDragStart = () => {
    const timelineTemplate = coldVal(timeStuffP.timelineTemplate)
    const range = val(
      ui._selectors.historic.getTemporaryPlaybackRangeLimit(
        ui.atomP.historic,
        timelineTemplate.address,
      ),
    )
    if (!range) {
      // shouldn't even happen
      return
    }

    deltaXToDeltaTime.current = coldVal(
      timeStuffP.viewportScrolledSpace.deltaXToDeltaTime,
    )
    refStuff.current!.rangeWhenDragStart = range
    refStuff.current!.tempActionGroup = ui.actions.historic.temp()
    setDragging(true)
  }

  const onDrag = (dx: number) => {
    const timeDiff = deltaXToDeltaTime.current(dx, false)
    const timeStuff = coldVal(timeStuffP)

    const clampTime = timeStuff.timeSpace.clamp

    const [from, to] = [
      refStuff.current!.rangeWhenDragStart!.from + timeDiff,
      refStuff.current!.rangeWhenDragStart!.to + timeDiff,
    ].map(clampTime)

    ui._dispatch(
      refStuff.current!.tempActionGroup!.push(
        ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
          limit: {from, to},
          ...timeStuff.timelineTemplate.address,
        }),
      ),
    )
  }

  const onDragEnd = (happened: boolean) => {
    setDragging(false)
    const tempActionGroup = refStuff.current!.tempActionGroup!
    ui._dispatch(
      happened ? tempActionGroup.commit() : tempActionGroup.discard(),
    )
    refStuff.current.tempActionGroup = undefined
  }

  const _openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuOpenState(true)
    setContextMenuCoords({x: e.clientX, y: e.clientY})
  }

  return autoDeriveElement(() => {
    const range = val(
      ui._selectors.historic.getTemporaryPlaybackRangeLimit(
        ui.atomP.historic,
        val(timeStuffP.timelineTemplate).address,
      ),
    )

    if (!range) return null

    const viewportWidth = val(timeStuffP.viewportSpace.width)
    const timeToInRangeX = val(timeStuffP.viewportScrolledSpace.timeToInRangeX)

    let [fromX, toX] = [timeToInRangeX(range.from), timeToInRangeX(range.to)]

    const invisible = toX < 0 || fromX > viewportWidth
    if (!invisible) {
      if (fromX < 0) fromX = 0
      if (toX > viewportWidth) toX = viewportWidth
    }
    const width = toX - fromX

    return (
      <>
        {contextMenuOpen && (
          <HalfPieContextMenu
            close={closeContextMenu}
            centerPoint={{
              top: contextMenuCoords.y,
              left: contextMenuCoords.x,
            }}
            placement="left"
            // renderInPortal={true}
            items={[
              {
                label: 'Remove playback range',
                cb: deleteLimit,
              },
            ]}
          />
        )}
        <DraggableArea
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrag={onDrag}
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
            onContextMenu={_openContextMenu}
            onClick={(dIsDown && deleteLimit) || noop}
          />
        </DraggableArea>
      </>
    )
  })
}

export default FillStrip
