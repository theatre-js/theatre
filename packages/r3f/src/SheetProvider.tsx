import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react'
import {useThree} from '@react-three/fiber'
import type {ISheet} from '@theatre/core'
import {bindToCanvas} from './store'

const ctx = createContext<{sheet: ISheet | undefined} | undefined>(undefined)

const useWrapperContext = (): {sheet: ISheet | undefined} => {
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
  getSheet: () => ISheet
}> = (props) => {
  const {scene, gl} = useThree((s) => ({scene: s.scene, gl: s.gl}))
  const [sheet, setSheet] = useState<ISheet | undefined>(undefined)

  useLayoutEffect(() => {
    const sheet = props.getSheet()
    if (!sheet || sheet.type !== 'Theatre_Sheet_PublicAPI') {
      throw new Error(
        `getSheet() in <Wrapper getSheet={getSheet}> has returned an invalid value`,
      )
    }
    setSheet(sheet)
    bindToCanvas({gl, scene})
  }, [scene, gl])

  return <ctx.Provider value={{sheet}}>{props.children}</ctx.Provider>
}

export default SheetProvider
