import {useEffect, useMemo} from 'react'

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

type CaptureInfo = {
  debugOwnerName: string
  debugReason: string
}

let currentCapture: null | CaptureInfo = null

const isPointerBeingCaptured = () => currentCapture != null

/**
 * @deprecated Once all the `usePopover()`/`useDrag()` calls are removed, we should move this to one of the actors under `useChordial()`
 */
export function createPointerCapturing(forDebugName: string) {
  /** keep track of the captures being made by this user of {@link usePointerCapturing} */
  let localCapture: CaptureInfo | null
  const updateCapture = (to: CaptureInfo | null): CaptureInfo | null => {
    localCapture = to
    currentCapture = to
    return to
  }
  const capturing: PointerCapturing = {
    capturePointer(reason) {
      if (currentCapture != null) {
        throw new Error(
          `"${forDebugName}" attempted capturing pointer for "${reason}" while already captured by "${currentCapture.debugOwnerName}" for "${currentCapture.debugReason}"`,
        )
      }

      const releaseCapture = updateCapture({
        debugOwnerName: forDebugName,
        debugReason: reason,
      })

      return {
        isCapturing() {
          return releaseCapture === currentCapture
        },
        release() {
          if (releaseCapture === currentCapture) {
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
      if (localCapture && currentCapture === localCapture) {
        updateCapture(null)
      }
    },
  }
}

/**
 * @deprecated Once all the `usePopover()`/`useDrag()` calls are removed, we should move this to one of the actors under `useChordial()`
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
  const control = useMemo(() => {
    return createPointerCapturing(forDebugName)
  }, [forDebugName, createPointerCapturing])

  useEffect(() => {
    return () => {
      // force release on unmount
      control.forceRelease()
    }
  }, [control])

  return control.capturing
}
