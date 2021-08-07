import setupPlugin from './setupPlugin'
export {default as EditorHelper} from './components/EditorHelper'
export type {EditorHelperProps} from './components/EditorHelper'
export {default as editable} from './components/editable'
export type {EditableState, BindFunction} from './store'
export {default as Wrapper} from './Wrapper'

if (process.env.NODE_ENV === 'development') {
  setupPlugin()
}
