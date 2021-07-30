import SnapshotEditor from './components/SnapshotEditor'

export {default as EditorHelper} from './components/EditorHelper'
export type {EditorHelperProps} from './components/EditorHelper'

export {default as editable} from './components/editable'
export type {EditableState, BindFunction} from './store'
import studio from '@theatre/studio'
import Toolbar from './components/Toolbar/Toolbar'
import {types} from '@theatre/core'
import React, {useLayoutEffect} from 'react'
import {useThree} from '@react-three/fiber'
import type {ISheet} from '@theatre/core'
import {bindToCanvas} from './store'

export const Wrapper: React.FC<{
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
    bindToCanvas({sheet})({gl, scene})
  }, [scene, gl])

  return <>{props.children}</>
}

if (process.env.NODE_ENV === 'development') {
  studio.extend({
    id: '@theatre/plugin-r3f',
    globalToolbar: {
      component: Toolbar,
    },
    panes: [
      {
        class: 'snapshotEditor',
        dataType: types.compound({
          grosse: types.number(20),
        }),
        component: SnapshotEditor,
      },
    ],
  })
}
