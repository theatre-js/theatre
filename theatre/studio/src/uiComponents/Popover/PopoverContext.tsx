import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {createContext, useContext, default as React} from 'react'

export type PopoverContext = {
  triggerPoint?: {clientX: number; clientY: number}
  onPointerOutOfThreshold: () => void
  /**
   * How far from the menu should the pointer travel to auto close the menu
   */
  pointerDistanceThreshold: number
}

const defaultPointerDistanceThreshold = 200

const ctx = createContext<PopoverContext>(null as $IntentionalAny)

export const usePopoverContext = () => useContext(ctx)

export const PopoverContextProvider: React.FC<{
  triggerPoint: PopoverContext['triggerPoint']
  onPointerOutOfThreshold: PopoverContext['onPointerOutOfThreshold']
  pointerDistanceThreshold?: number
}> = ({
  children,
  triggerPoint,
  pointerDistanceThreshold = defaultPointerDistanceThreshold,
  onPointerOutOfThreshold,
}) => {
  return (
    <ctx.Provider
      value={{triggerPoint, pointerDistanceThreshold, onPointerOutOfThreshold}}
    >
      {children}
    </ctx.Provider>
  )
}
