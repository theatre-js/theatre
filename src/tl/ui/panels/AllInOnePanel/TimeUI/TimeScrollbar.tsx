import React, {useMemo} from 'react'
import css from './Scroller.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  anySpace_xToTime,
  getRangeLabel,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {getNewRange} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {autoDeriveElement} from '$shared/DataVerse/utils/react'
import {useTimeStuffP} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {coldVal, val} from '$shared/DataVerse/atom'

const classes = resolveCss(css)

/**
 * The little scrollbar on the bottom of the Right side
 */
const TimeScrollbar = () => {
  const timeStuffP = useTimeStuffP()
  const handles = useMemo(
    function getHandles() {
      let stuffBeforeMove = coldVal(timeStuffP)
      const self = {
        recordStuffBeforeMove: () => {
          stuffBeforeMove = coldVal(timeStuffP)
        },

        updateRange: (dx: number) => {
          const duration = stuffBeforeMove.rangeAndDuration.overshotDuration
          const viewportWidth = stuffBeforeMove.viewportSpace.width
          const dt = anySpace_xToTime(duration, viewportWidth)(dx)
          self._setRange({from: dt, to: dt}, true)
        },

        updateRangeFrom: (dx: number) => {
          const duration = stuffBeforeMove.rangeAndDuration.overshotDuration
          const viewportWidth = stuffBeforeMove.viewportSpace.width
          const dt = anySpace_xToTime(duration, viewportWidth)(dx)
          self._setRange({from: dt, to: 0}, false)
        },

        updateRangeTo: (dx: number) => {
          const duration = stuffBeforeMove.rangeAndDuration.overshotDuration
          const viewportWidth = stuffBeforeMove.viewportSpace.width
          const dt = anySpace_xToTime(duration, viewportWidth)(dx)
          self._setRange({from: 0, to: dt}, false)
        },

        _setRange(
          change: TRange,
          bringRangeToBackIfRangeFromIsSubzero: boolean,
        ) {
          const range = stuffBeforeMove.rangeAndDuration.range
          const duration = stuffBeforeMove.rangeAndDuration.overshotDuration

          const {setRange} = stuffBeforeMove
          setRange(
            getNewRange(
              range,
              change,
              duration,
              bringRangeToBackIfRangeFromIsSubzero,
            ),
          )
        },
      }

      return self
    },
    [timeStuffP],
  )

  return autoDeriveElement(() => {
    const range = val(timeStuffP.rangeAndDuration.range)
    const duration = val(timeStuffP.rangeAndDuration.overshotDuration)
    const viewportWidth = val(timeStuffP.viewportSpace.width)
    const timeToViewportX = val(timeStuffP.viewportSpace.timeToX)
    const getLabel = getRangeLabel(range, duration, viewportWidth)
    const rangeFromX = timeToViewportX(range.from, true)
    const rangeToX = timeToViewportX(range.to, true)

    return (
      <div {...classes('container')}>
        <div {...classes('timeThread')}>
          <DraggableArea
            onDragStart={handles.recordStuffBeforeMove}
            onDrag={handles.updateRange}
            lockCursorTo="ew-resize"
          >
            <div
              {...classes('rangeBar')}
              style={{
                width: `${rangeToX - rangeFromX}px`,
                transform: `translate3d(${rangeFromX}px, 0, 0)`,
              }}
            />
          </DraggableArea>
          <DraggableArea
            onDrag={handles.updateRangeFrom}
            lockCursorTo="w-resize"
            onDragStart={handles.recordStuffBeforeMove}
          >
            <div
              {...classes('rangeFromHandle')}
              style={{transform: `translate3d(${rangeFromX}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{getLabel(range.from)}</div>
            </div>
          </DraggableArea>
          <DraggableArea
            onDrag={handles.updateRangeTo}
            lockCursorTo="e-resize"
            onDragStart={handles.recordStuffBeforeMove}
          >
            <div
              {...classes('rangeToHandle')}
              style={{transform: `translate3d(${rangeToX}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{getLabel(range.to)}</div>
            </div>
          </DraggableArea>
        </div>
      </div>
    )
  })
}

export default TimeScrollbar
