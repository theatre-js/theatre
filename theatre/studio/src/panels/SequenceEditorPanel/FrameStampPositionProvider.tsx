import type {IDerivation, Pointer} from '@theatre/dataverse'
import {Atom, prism, val} from '@theatre/dataverse'
import mousePositionD from '@theatre/studio/utils/mousePositionD'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {inRange, last} from 'lodash-es'
import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import type {SequenceEditorPanelLayout} from './layout/layout'

type FrameStampPositionLock = {
  unlock: () => void
  set: (pointerPositonInUnitSpace: number) => void
}

export enum FrameStampPositionType {
  hidden,
  locked,
  snapped,
  free,
}

const context = createContext<{
  currentD: IDerivation<[pos: number, posType: FrameStampPositionType]>
  getLock(): FrameStampPositionLock
}>(null as $IntentionalAny)

type LockItem = {
  position: [
    pos: number,
    posType: FrameStampPositionType.locked | FrameStampPositionType.hidden,
  ]
  id: number
}

let lastLockId = 0

/**
 * Provides snapping positions to "stamps".
 *
 * One example of a stamp includes the "Keyframe Dot" which show a `⌜⌞⌝⌟` kinda UI
 * around the dot when dragged over.
 */
const FrameStampPositionProvider: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({children, layoutP}) => {
  const locksAtom = useMemo(() => new Atom<{list: LockItem[]}>({list: []}), [])
  const currentD = useMemo(
    () =>
      prism(() => {
        const pointerPos = prism
          .memo('p', () => pointerPositionInUnitSpace(layoutP), [layoutP])
          .getValue()

        const locks = val(locksAtom.pointer.list)

        if (locks.length > 0) {
          return last(locks)!.position
        } else {
          return pointerPos
        }
      }),
    [layoutP],
  )
  const getLock = useCallback(() => {
    const id = lastLockId++
    locksAtom.reduceState(['list'], (list) => [
      ...list,
      {
        id,
        position: [-1, FrameStampPositionType.hidden],
      },
    ])

    const unlock = () => {
      locksAtom.reduceState(['list'], (list) =>
        list.filter((lock) => lock.id !== id),
      )
    }

    const set = (posInUnitSpace: number) => {
      locksAtom.reduceState(['list'], (list) => {
        const index = list.findIndex((lock) => lock.id === id)
        if (index === -1) {
          console.warn(`Lock is already freed. This is a bug.`)
          return list
        }

        const newList = [...list]

        newList.splice(index, 1, {
          id,
          position: [
            posInUnitSpace,
            posInUnitSpace === -1
              ? FrameStampPositionType.hidden
              : FrameStampPositionType.locked,
          ],
        })

        return newList
      })
    }

    return {
      set,
      unlock,
    }
  }, [])

  const value = {
    currentD,
    getLock,
  }

  return <context.Provider value={value}>{children}</context.Provider>
}

export const useFrameStampPositionD = () => useContext(context).currentD

export const useLockFrameStampPosition = (shouldLock: boolean, val: number) => {
  const {getLock} = useContext(context)
  const lockRef = useRef<undefined | ReturnType<typeof getLock>>()

  useLayoutEffect(() => {
    if (!shouldLock) return
    lockRef.current = getLock()

    return () => {
      lockRef.current!.unlock()
    }
  }, [shouldLock])

  useLayoutEffect(() => {
    if (shouldLock) {
      lockRef.current!.set(val)
    }
  }, [val])
}

/**
 * This attribute is used so that when the cursor hovers over a keyframe,
 * the framestamp snaps to the position of that keyframe.
 *
 * Use as a spread in a React element.
 *
 * @example
 * ```tsx
 * <div {...includeLockFrameStampAttrs(10)}/>
 * ```
 *
 * @remarks
 * Elements that need this behavior must set a data attribute like so:
 * <div data-theatre-lock-framestamp-to="120.55" />
 * Setting this attribute to "hide" hides the stamp.
 *
 * @see lockedCursorCssVarName - CSS variable used to set the cursor on an element that
 * should lock the framestamp. Look for usages.
 * @see pointerEventsAutoInNormalMode - CSS snippet used to correctly set
 * `pointer-events` on an element that should lock the framestamp.
 *
 * See {@link FrameStampPositionProvider}
 *
 */
export const includeLockFrameStampAttrs = (value: number | 'hide') => ({
  [ATTR_LOCK_FRAMESTAMP]: value === 'hide' ? value : value.toFixed(3),
})

const ATTR_LOCK_FRAMESTAMP = 'data-theatre-lock-framestamp-to'

const pointerPositionInUnitSpace = (
  layoutP: Pointer<SequenceEditorPanelLayout>,
): IDerivation<[pos: number, posType: FrameStampPositionType]> => {
  return prism(() => {
    const rightDims = val(layoutP.rightDims)
    const clippedSpaceToUnitSpace = val(layoutP.clippedSpace.toUnitSpace)
    const leftPadding = val(layoutP.scaledSpace.leftPadding)

    const mousePos = val(mousePositionD)
    if (!mousePos) return [-1, FrameStampPositionType.hidden]

    for (const el of mousePos.composedPath()) {
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) break

      if (el.hasAttribute(ATTR_LOCK_FRAMESTAMP)) {
        const val = el.getAttribute(ATTR_LOCK_FRAMESTAMP)
        if (typeof val !== 'string') continue
        if (val === 'hide') return [-1, FrameStampPositionType.hidden]
        const double = parseFloat(val)

        if (isFinite(double) && double >= 0)
          return [double, FrameStampPositionType.snapped]
      }
    }

    const {clientX, clientY} = mousePos

    const {screenX: x, screenY: y, width: rightWidth, height} = rightDims

    if (
      inRange(clientX, x, x + rightWidth) &&
      inRange(
        clientY,
        y + 16 /* leaving a bit of space for the top stip here */,
        y + height,
      )
    ) {
      const posInRightDims = clientX - x
      const posInUnitSpace = clippedSpaceToUnitSpace(posInRightDims)

      return [posInUnitSpace, FrameStampPositionType.free]
    } else {
      return [-1, FrameStampPositionType.hidden]
    }
  })
}

export default FrameStampPositionProvider
