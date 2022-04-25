import React, {useContext, useMemo} from 'react'
import logger from '@theatre/shared/logger'

/** See {@link PointerCapturing} */
export type CapturedPointer = {
  release(): void
}

/**
 * Introduced `PointerCapturing` for addressing issues with over-shooting easing curves closing the popup preset modal.
 *
 * Goal is to be able to determine if the pointer is being captured somewhere in studio (e.g. dragging).
 *
 * Some other ideas we considered before going with the PointerCapturing provider and context
 * - provider: `onPointerCaptureChanged`
 * - `onDragging={isMouseActive = true}` / `onMouseActive={isMouseActive = true}`
 * - dragging tracked application wide (ahistoric state) in popover
 *
 * Caveats: I wonder if there's a shared abstraction we should use for "releasing" e.g. unsubscribe / untap in rxjs / tapable patterns.
 */
export type PointerCapturing = {
  isPointerBeingCaptured(): boolean
  capturePointer(debugReason: string): CapturedPointer
}

type PointerCapturingFn = (forDebugName: string) => PointerCapturing

function _createPointerCapturingContext(): PointerCapturingFn {
  let currentCapture: null | {debugOwnerName: string; debugReason: string} =
    null

  return (forDebugName) => ({
    capturePointer(reason) {
      logger.log('Capturing pointer', {forDebugName, reason})
      if (currentCapture != null) {
        throw new Error(
          `"${forDebugName}" attempted capturing pointer for "${reason}" while already captured by "${currentCapture.debugOwnerName}" for "${currentCapture.debugReason}"`,
        )
      }

      currentCapture = {debugOwnerName: forDebugName, debugReason: reason}

      const releaseCapture = currentCapture
      return {
        release() {
          if (releaseCapture === currentCapture) {
            logger.log('Releasing pointer', {
              forDebugName,
              reason,
            })
            currentCapture = null
          }
        },
      }
    },
    isPointerBeingCaptured() {
      return currentCapture != null
    },
  })
}

const PointerCapturingContext = React.createContext<PointerCapturingFn>(
  _createPointerCapturingContext(),
)

/**
 * See {@link PointerCapturing}.
 *
 * This should likely live towards the root of the application.
 *
 * Uncertain about whether nesting pointer capturing providers should be cognizant of each other.
 */
export function ProvidePointerCapturing(props: {
  children?: React.ReactNode
}): React.ReactElement {
  // Consider whether we want to manage multiple providers nested (e.g. embedding Theatre.js in Theatre.js or studio into whatever else)
  // This may not be necessary to consider due to the design of allowing a default value for contexts...
  // 1/10 importance to think about, now.
  // const parentCapturing = useContext(PointerCapturingContext)
  return (
    <PointerCapturingContext.Provider
      value={_createPointerCapturingContext()}
      children={props.children}
    />
  )
}

export function usePointerCapturing(forDebugName: string): PointerCapturing {
  const pointerCapturingFn = useContext(PointerCapturingContext)
  return useMemo(
    () => pointerCapturingFn(forDebugName),
    [forDebugName, pointerCapturingFn],
  )
}
