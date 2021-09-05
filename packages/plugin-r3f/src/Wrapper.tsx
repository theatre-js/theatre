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

export const useWrapperContext = ():
  | {sheet: ISheet | undefined}
  | undefined => {
  return useContext(ctx)
}

const Wrapper: React.FC<{
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

export default Wrapper
