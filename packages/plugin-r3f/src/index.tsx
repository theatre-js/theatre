import React from 'react'
import {render} from 'react-dom'
import Editor from './components/Editor'

export {default as EditorHelper} from './components/EditorHelper'
export type {EditorHelperProps} from './components/EditorHelper'

export {default as editable} from './components/editable'
export {bindToCanvas} from './store'
export type {EditableState, BindFunction} from './store'
import studio from '@theatre/studio'
import Toolbar from './components/Toolbar/Toolbar'

if (process.env.NODE_ENV === 'development') {
  studio.extend({
    id: '@theatre/plugin-r3f',
    globalToolbar: {
      component: Toolbar,
    },
  })
  const editorRoot = document.createElement('div')
  document.body.appendChild(editorRoot)

  render(<Editor />, editorRoot)
}
