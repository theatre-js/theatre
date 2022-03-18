import {voidFn} from '@theatre/shared/utils'
import React, {createContext, useCallback, useContext, useRef} from 'react'
import styled from 'styled-components'
import {focusRangeTheme} from './RightOverlay/FocusRangeZone/FocusRangeZone'
import {zIndexes} from './SequenceEditorPanel'

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  z-index: ${() => zIndexes.scrollableArea};

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
  margin-top: ${focusRangeTheme.height + 5}px;
`

type ReceiveVerticalWheelEventFn = (ev: WheelEvent) => void

const ctx = createContext<ReceiveVerticalWheelEventFn>(voidFn)
export const useReceiveVerticalWheelEvent = (): ReceiveVerticalWheelEventFn =>
  useContext(ctx)

const VerticalScrollContainer: React.FC<{}> = (props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const receiveVerticalWheelEvent = useCallback<ReceiveVerticalWheelEventFn>(
    (event: WheelEvent) => {
      // const ev = new WheelEvent('wheel', {deltaY: event.deltaY})
      // ref.current!.scrollBy(0, event.deltaY)
      // ref.current!.dispatchEvent(ev)
    },
    [],
  )

  return (
    <ctx.Provider value={receiveVerticalWheelEvent}>
      <Container ref={ref}>{props.children}</Container>
    </ctx.Provider>
  )
}

export default VerticalScrollContainer
