import React, {useLayoutEffect} from 'react'
import {useThree} from '@react-three/fiber'
import type {ISheet} from '@theatre/core'
import {bindToCanvas} from './store'

const Wrapper: React.FC<{
  getSheet: () => ISheet
}> = (props) => {
  const {scene, gl} = useThree((s) => ({scene: s.scene, gl: s.gl}))

  useLayoutEffect(() => {
    const sheet = props.getSheet()
    if (!sheet || sheet.type !== 'Theatre_Sheet_PublicAPI') {
      throw new Error(
        `getSheet() in <Wrapper getSheet={getSheet}> has returned an invalid value`,
      )
    }
    bindToCanvas({sheet, gl, scene})
  }, [scene, gl])

  return <>{props.children}</>
}

export default Wrapper
