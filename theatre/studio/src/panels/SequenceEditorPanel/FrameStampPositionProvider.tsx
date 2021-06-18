import type {IDerivation, Pointer} from '@theatre/dataverse'
import {Atom, prism, val} from '@theatre/dataverse'
import mousePositionD from '@theatre/shared/utils/mousePositionD'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {inRange, last} from 'lodash-es'
import React, {createContext, useCallback, useContext, useMemo} from 'react'
import type {SequenceEditorPanelLayout} from './layout/layout'

export type FrameStampPositionLock = {
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

export const useFrameStampPosition = () => useContext(context)

const pointerPositionInUnitSpace = (
  layoutP: Pointer<SequenceEditorPanelLayout>,
): IDerivation<number> => {
  return prism(() => {
    const rightDims = val(layoutP.rightDims)
    const clippedSpaceToUnitSpace = val(layoutP.clippedSpace.toUnitSpace)
    const leftPadding = val(layoutP.scaledSpace.leftPadding)

    const {clientX, clientY} = val(mousePositionD)

    const {screenX: x, screenY: y, width: rightWidth, height} = rightDims
    const bottomRectangleThingyDims = val(layoutP.bottomRectangleThingyDims)

    if (
      inRange(clientX, x, x + rightWidth) &&
      inRange(clientY, y, y + height) &&
      !inRange(
        clientY,
        bottomRectangleThingyDims.screenY,
        bottomRectangleThingyDims.screenY + bottomRectangleThingyDims.height,
      )
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
