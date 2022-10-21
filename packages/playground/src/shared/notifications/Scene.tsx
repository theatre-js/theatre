import React, {useLayoutEffect, useRef} from 'react'
import type {IProject} from '@theatre/core'
import {onChange, types} from '@theatre/core'

const globalConfig = {
  background: {
    type: types.stringLiteral('black', {
      black: 'black',
      white: 'white',
      dynamic: 'dynamic',
    }),
    dynamic: types.rgba(),
  },
}

export const Scene: React.FC<{project: IProject}> = ({project}) => {
  // This is cheap to call and always returns the same value, so no need for useMemo()
  const sheet = project.sheet('Scene', 'default')
  const containerRef = useRef<HTMLDivElement>(null!)
  const globalObj = sheet.object('global', globalConfig)

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(globalObj.props, (newValues) => {
      containerRef.current.style.background =
        newValues.background.type !== 'dynamic'
          ? newValues.background.type
          : newValues.background.dynamic.toString()
    })
    return unsubscribeFromChanges
  }, [globalObj])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: 0,
        bottom: '0',
        background: '#333',
      }}
    ></div>
  )
}
