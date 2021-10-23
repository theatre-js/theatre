import studio from '@theatre/studio'
import type {UseDragOpts} from './useDrag'
import useDrag from './useDrag'
import React, {useLayoutEffect, useMemo, useState} from 'react'
import type {IProject, ISheet} from '@theatre/core'
import {onChange, types} from '@theatre/core'
import type {IScrub, IStudio} from '@theatre/studio'

studio.initialize()

const boxObjectConfig = {
  x: types.number(200),
  y: types.number(200),
  background: types.color('#FF0000'),
}

const Box: React.FC<{
  id: string
  sheet: ISheet
  selection: IStudio['selection']
}> = ({id, sheet, selection}) => {
  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object(id, boxObjectConfig)

  const isSelected = selection.includes(obj)

  const [state, setState] = useState<{
    x: number
    y: number
    background: string
  }>({x: 0, y: 0, background: '#ff0000'})

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(obj.props, (newValues) => {
      setState(newValues)
    })
    return unsubscribeFromChanges
  }, [id])

  const [divRef, setDivRef] = useState<HTMLElement | null>(null)

  const dragOpts = useMemo((): UseDragOpts => {
    let scrub: IScrub | undefined
    let initial: typeof obj.value
    let firstOnDragCalled = false
    return {
      onDragStart() {
        scrub = studio.scrub()
        initial = obj.value
        firstOnDragCalled = false
      },
      onDrag(x, y) {
        if (!firstOnDragCalled) {
          studio.setSelection([obj])
          firstOnDragCalled = true
        }
        scrub!.capture(({set}) => {
          set(obj.props, {
            x: x + initial.x,
            y: y + initial.y,
            background: initial.background,
          })
        })
      },
      onDragEnd(dragHappened) {
        if (dragHappened) {
          scrub!.commit()
        } else {
          scrub!.discard()
        }
      },
      lockCursorTo: 'move',
    }
  }, [])

  useDrag(divRef, dragOpts)

  return (
    <div
      onClick={() => {
        studio.setSelection([obj])
      }}
      ref={setDivRef}
      style={{
        width: 100,
        height: 100,
        background: state.background,
        position: 'absolute',
        left: state.x + 'px',
        top: state.y + 'px',
        boxSizing: 'border-box',
        border: isSelected ? '1px solid #5a92fa' : '1px solid transparent',
      }}
    ></div>
  )
}

let lastBoxId = 1

export const Scene: React.FC<{project: IProject}> = ({project}) => {
  const [boxes, setBoxes] = useState<Array<string>>(['0', '1'])

  // This is cheap to call and always returns the same value, so no need for useMemo()
  const sheet = project.sheet('Scene', 'default')
  const [selection, setSelection] = useState<IStudio['selection']>()

  useLayoutEffect(() => {
    return studio.onSelectionChange((newState) => {
      setSelection(newState)
    })
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: 0,
        bottom: '0',
        background: 'black',
      }}
    >
      <button
        style={{
          top: '16px',
          left: '60px',
          position: 'absolute',
        }}
        onClick={() => {
          setBoxes((boxes) => [...boxes, String(++lastBoxId)])
        }}
      >
        Add
      </button>
      {boxes.map((id) => (
        <Box
          key={'box' + id}
          id={id}
          sheet={sheet}
          selection={selection ?? []}
        />
      ))}
    </div>
  )
}
