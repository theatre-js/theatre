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

const context = createContext<{
  currentD: IDerivation<number>
  getLock(): FrameStampPositionLock
}>(null as $IntentionalAny)

type LockItem = {
  position: number
  id: number
}

let lastLockId = 0

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
        position: -1,
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
          position: posInUnitSpace,
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
 * Elements that need this behavior must set a data attribute like so:
 * <div data-theatre-lock-framestamp-to="120.55" />
 * Setting this attribute to "hide" hides the stamp.
 */
export const attributeNameThatLocksFramestamp =
  'data-theatre-lock-framestamp-to'
const pointerPositionInUnitSpace = (
  layoutP: Pointer<SequenceEditorPanelLayout>,
): IDerivation<number> => {
  return prism(() => {
    const rightDims = val(layoutP.rightDims)
    const clippedSpaceToUnitSpace = val(layoutP.clippedSpace.toUnitSpace)
    const leftPadding = val(layoutP.scaledSpace.leftPadding)

    const mousePos = val(mousePositionD)
    if (!mousePos) return -1

    for (const el of mousePos.composedPath()) {
      if (!(el instanceof HTMLElement || el instanceof SVGElement)) break

      if (el.hasAttribute(attributeNameThatLocksFramestamp)) {
        const val = el.getAttribute(attributeNameThatLocksFramestamp)
        if (typeof val !== 'string') continue
        if (val === 'hide') return -1
        const double = parseFloat(val)

        if (isFinite(double) && double >= 0) return double
      }
    }

    const {clientX, clientY} = mousePos

    const {screenX: x, screenY: y, width: rightWidth, height} = rightDims

    if (
      inRange(clientX, x, x + rightWidth) &&
      inRange(clientY, y, y + height)
    ) {
      const posInRightDims = clientX - x
      const posInUnitSpace = clippedSpaceToUnitSpace(posInRightDims)

      return posInUnitSpace
    } else {
      return -1
    }
  })
}

export default FrameStampPositionProvider
