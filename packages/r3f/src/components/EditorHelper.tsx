import type {ComponentProps, ElementType} from 'react'
import React from 'react'
import {useEditorStore} from '../store'
import {createPortal} from '@react-three/fiber'

export type EditorHelperProps<T extends ElementType> = {
  component: T
} & ComponentProps<T>

const EditorHelper = <T extends ElementType>({
  component: Component,
  ...props
}: EditorHelperProps<T>) => {
  if (process.env.NODE_ENV === 'development') {
    const helpersRoot = useEditorStore((state) => state.helpersRoot)

    return <>{createPortal(<Component {...props} />, helpersRoot)}</>
  } else {
    return null
  }
}

export default EditorHelper
