import resolveCss from '$shared/utils/resolveCss'
import React, {useState, useContext, useRef, memo} from 'react'
import * as css from './Base.css'
import {coldVal} from '$shared/DataVerse/atom'
import {
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import CursorLock from '$shared/components/CursorLock'
import {TimeStuffContext} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {UIContext} from '$tl/ui/UI'

const classes = resolveCss(css)

const Base = memo(() => {
  const [isDragging, setIsDragging] = useState(false)
  const activeMode = useContext(ActiveModeContext)
  const shiftIsDown = activeMode === MODES.shift
  const dragStartTime = useRef<number | undefined>(undefined)
  const tempActionGroup = useRef<$FixMe>(undefined)
  const timeStuffP = useContext(TimeStuffContext)
  const ui = useContext(UIContext)

  const onShiftDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    const {layerX} = e.nativeEvent
    dragStartTime.current = coldVal(
      timeStuffP.viewportScrolledSpace,
    ).inRangeXToTime(layerX)
    tempActionGroup.current = ui.actions.historic.temp()
  }

  const onShiftDrag = (dx: number) => {
    const timeStuff = coldVal(timeStuffP)
    const timeDiff = timeStuff.viewportScrolledSpace.deltaXToDeltaTime(dx)

    let [from, to] = (timeDiff >= 0
      ? [dragStartTime.current!, dragStartTime.current! + timeDiff]
      : [dragStartTime.current! + timeDiff, dragStartTime.current!]
    ).map(timeStuff.timeSpace.clamp)

    ui._dispatch(
      tempActionGroup.current!.push(
        ui.actions.historic.setTemporaryPlaybackRangeLimitOfTimeline({
          limit: {from, to},
          ...timeStuff.timelineTemplate.address,
        }),
      ),
    )
  }

  const onShiftDragEnd = (happened: boolean) => {
    setIsDragging(false)

    ui._dispatch(
      happened
        ? tempActionGroup.current!.commit()
        : tempActionGroup.current!.discard(),
    )
    tempActionGroup.current = undefined
  }

  return (
    <>
      <CursorLock cursor="ew-resize" enabled={isDragging} />
      <DraggableArea
        enabled={shiftIsDown}
        onDragStart={onShiftDragStart}
        onDrag={onShiftDrag}
        onDragEnd={onShiftDragEnd}
      >
        <div
          {...classes(
            'container',
            shiftIsDown && 'shiftIsDown',
            isDragging && 'dragging',
          )}
        />
      </DraggableArea>
    </>
  )
})

export default Base
