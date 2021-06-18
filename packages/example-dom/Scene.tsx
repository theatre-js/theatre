import type {IScrub, IStudio} from '@theatre/studio'
import studio from '@theatre/studio'
import React, {useLayoutEffect, useMemo, useState} from 'react'
import type {ISheet, ISheetObject, IProject} from '@theatre/core'
import {types as t} from '@theatre/core'
import type {UseDragOpts} from './useDrag'
import useDrag from './useDrag'

const boxObjectConfig = {
  props: t.compound({
    x: t.number(0),
    y: t.number(0),
  }),
}

const Box: React.FC<{
  id: string
  sheet: ISheet
  selectedObject: ISheetObject | undefined
}> = ({id, sheet, selectedObject}) => {
  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object(id, null, boxObjectConfig)

  const isSelected = selectedObject === obj

  const [pos, setPos] = useState<{x: number; y: number}>({x: 0, y: 0})

  useLayoutEffect(() => {
    const unsubscribeFromChanges = obj.onValuesChange((newValues) => {
      setPos(newValues)
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
          studio.__experimental_setSelectedObject(obj)
          firstOnDragCalled = true
        }
        scrub!.capture(({set}) => {
          set(obj.props, {x: x + initial.x, y: y + initial.y})
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
        studio.__experimental_setSelectedObject(obj)
      }}
      ref={setDivRef}
      style={{
        width: 100,
        height: 100,
        background: 'gray',
        position: 'absolute',
        left: pos.x + 'px',
        top: pos.y + 'px',
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
  const [studioState, setStudioState] = useState<IStudio['state']>()

  useLayoutEffect(() => {
    return studio.__experimental_onStateChange((newState) => {
      setStudioState(newState)
    })
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        background: '#575757',
      }}
    >
      <button
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
          selectedObject={studioState?.selectedObject}
        />
      ))}
    </div>
  )
}
