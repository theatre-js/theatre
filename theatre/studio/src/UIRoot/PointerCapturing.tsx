import React, {useContext, useEffect, useMemo} from 'react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'

/** See {@link PointerCapturing} */
export type CapturedPointer = {
  release(): void
  /** Double check that you still have the current capture and weren't forcibly released */
  isCapturing(): boolean
}

/**
 * Introduced `PointerCapturing` for addressing issues with over-shooting easing curves closing the popup preset modal.
 *
 * Goal is to be able to determine if the pointer is being captured somewhere in studio (e.g. dragging).
 *
 * Some other ideas we considered before going with the PointerCapturing provider and context
 * - provider: `onPointerCaptureChanged`
 * - `onDragging={isMouseActive = true}` / `onMouseActive={isMouseActive = true}`
 * - dragging tracked application wide (ephemeral state) in popover
 *
 * Caveats: I wonder if there's a shared abstraction we should use for "releasing" e.g. unsubscribe / untap in rxjs / tapable patterns.
 */
export type PointerCapturing = {
  isPointerBeingCaptured(): boolean
  capturePointer(debugReason: string): CapturedPointer
}

type InternalPointerCapturing = {
  capturing: PointerCapturing
  forceRelease(): void
}

type PointerCapturingFn = (forDebugName: string) => InternalPointerCapturing

function _usePointerCapturingContext(): PointerCapturingFn {
  const logger = useLogger('PointerCapturing')
  type CaptureInfo = {
    debugOwnerName: string
    debugReason: string
  }
  let currentCaptureRef = React.useRef<null | CaptureInfo>(null)
  const isPointerBeingCaptured = () => currentCaptureRef.current != null

  return (forDebugName) => {
    /** keep track of the captures being made by this user of {@link usePointerCapturing} */
    let localCapture: CaptureInfo | null
    const updateCapture = (to: CaptureInfo | null): CaptureInfo | null => {
      localCapture = to
      currentCaptureRef.current = to
      return to
    }
    const capturing: PointerCapturing = {
      capturePointer(reason) {
        logger._debug('Capturing pointer', {forDebugName, reason})
        if (currentCaptureRef.current != null) {
          throw new Error(
            `"${forDebugName}" attempted capturing pointer for "${reason}" while already captured by "${currentCaptureRef.current.debugOwnerName}" for "${currentCaptureRef.current.debugReason}"`,
          )
        }

        const releaseCapture = updateCapture({
          debugOwnerName: forDebugName,
          debugReason: reason,
        })

        return {
          isCapturing() {
            return releaseCapture === currentCaptureRef.current
          },
          release() {
            if (releaseCapture === currentCaptureRef.current) {
              logger._debug('Releasing pointer', {
                forDebugName,
                reason,
              })
              updateCapture(null)
              return true
            }
            return false
          },
        }
      },
      isPointerBeingCaptured,
    }

    return {
      capturing,
      forceRelease() {
        if (localCapture && currentCaptureRef.current === localCapture) {
          logger._debug('Force releasing pointer', {localCapture})
          updateCapture(null)
        }
      },
    }
  }
}

const PointerCapturingContext = React.createContext<PointerCapturingFn>(
  null as $IntentionalAny,
)

const ProviderChildrenMemo: React.FC<{}> = React.memo(({children}) => (
  <>{children}</>
))

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
  const ctx = _usePointerCapturingContext()
  // Consider whether we want to manage multiple providers nested (e.g. embedding Theatre.js in Theatre.js or studio into whatever else)
  // This may not be necessary to consider due to the design of allowing a default value for contexts...
  // 1/10 importance to think about, now.
  // const parentCapturing = useContext(PointerCapturingContext)
  return (
    <PointerCapturingContext.Provider value={ctx}>
      <ProviderChildrenMemo children={props.children} />
    </PointerCapturingContext.Provider>
  )
}

/**
 * Used to ensure we're locking drag and pointer events to a single place in the UI logic.
 * Without this, we can much more easily accidentally create multiple drag handlers on
 * child / parent dom elements which both `useDrag`, for example.
 *
 * An example of this helping us was when we first started building the Curve editor popover.
 * In that activity, we were experiencing a weird issue where the popover would unmount while
 * dragging away from the popover, and the drag end listener would not be called.
 * By having "Pointer Capturing" we're able to identify that the pointer was not being properly
 * released, because there would be a lock contention when trying to drag something else.
 */
export function usePointerCapturing(forDebugName: string): PointerCapturing {
  const pointerCapturingFn = useContext(PointerCapturingContext)
  const control = useMemo(() => {
    return pointerCapturingFn(forDebugName)
  }, [forDebugName, pointerCapturingFn])

  useEffect(() => {
    return () => {
      // force release on unmount
      control.forceRelease()
    }
  }, [control])

  return control.capturing
}
