import {voidFn} from '@theatre/shared/utils'
import React, {createContext, useCallback, useContext, useRef} from 'react'
import styled from 'styled-components'
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
`

type ReceiveVerticalWheelEventFn = (ev: Pick<WheelEvent, 'deltaY'>) => void

const ctx = createContext<ReceiveVerticalWheelEventFn>(voidFn)

/**
 * See {@link VerticalScrollContainer} and references for how to use this.
 */
export const useReceiveVerticalWheelEvent = (): ReceiveVerticalWheelEventFn =>
  useContext(ctx)

/**
 * This is used in the sequence editor where we block wheel events to handle
 * pan/zoom on the time axis. The issue this solves, is that when blocking those
 * wheel events, we prevent the vertical scroll events from being fired. This container
 * comes with a context and a hook (see {@link useReceiveVerticalWheelEvent}) that allows
 * the code that traps the wheel events to pass them to the vertical scroller root, which
 * we then use to manually dispatch scroll events.
 */
const VerticalScrollContainer: React.FC<{}> = (props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const receiveVerticalWheelEvent = useCallback<ReceiveVerticalWheelEventFn>(
    (event) => {
      ref.current!.scrollBy(0, event.deltaY)
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
