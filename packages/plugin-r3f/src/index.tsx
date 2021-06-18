import React from 'react'
import {render} from 'react-dom'
import Editor from './components/Editor'

export {default as EditorHelper} from './components/EditorHelper'
export type {EditorHelperProps} from './components/EditorHelper'

export {default as editable} from './components/editable'
export {configure} from './store'
export type {EditableState, BindFunction} from './store'

if (process.env.NODE_ENV === 'development') {
  const editorRoot = document.createElement('div')
  document.body.appendChild(editorRoot)

  render(<Editor />, editorRoot)
}
