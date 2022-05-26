import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react'
import {useThree} from '@react-three/fiber'
import type {ISheet} from '@theatre/core'
import {bindToCanvas} from './store'

const ctx = createContext<{sheet: ISheet}>(undefined!)

const useWrapperContext = (): {sheet: ISheet} => {
  const val = useContext(ctx)
  if (!val) {
    throw new Error(
      `No sheet found. You need to add a <SheetProvider> higher up in the tree. https://docs.theatrejs.com/r3f.html#sheetprovider`,
    )
  }
  return val
}

export const useCurrentSheet = (): ISheet | undefined => {
  return useWrapperContext().sheet
}

const SheetProvider: React.FC<{
  sheet: ISheet
}> = ({sheet, children}) => {
  const {scene, gl} = useThree((s) => ({scene: s.scene, gl: s.gl}))

  useEffect(() => {
    if (!sheet || sheet.type !== 'Theatre_Sheet_PublicAPI') {
      throw new Error(`sheet in <Wrapper sheet={sheet}> has an invalid value`)
    }
  }, [sheet])

  useLayoutEffect(() => {
    bindToCanvas({gl, scene})
  }, [scene, gl])

  return <ctx.Provider value={{sheet}}>{children}</ctx.Provider>
}

export default SheetProvider
