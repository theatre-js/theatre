import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import React, {useLayoutEffect, useMemo, useState} from 'react'
import studio from '@theatre/studio'
import type {IProject, ISheet, ISheetObject} from '@theatre/core'
import {types as t} from '@theatre/core'
import type {IScrub, IStudio} from '@theatre/studio'

studio.initialize()

const boxObjectConfig = t.compound({
  position: t.compound({
    x: t.number(0),
    y: t.number(0),
    z: t.number(0),
  }),
  scale: t.compound({
    x: t.number(0),
    y: t.number(0),
    z: t.number(0),
    origin: t.compound({
      x: t.number(0),
      y: t.number(0),
    }),
    w: t.number(0),
  }),
})

const Box: React.FC<{
  id: string
  sheet: ISheet
  selection: ISheetObject[]
}> = ({id, sheet, selection: selection}) => {
  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object('object ' + id, null, boxObjectConfig)

  const isSelected = selection.includes(obj)

  const [pos, setPos] = useState<{x: number; y: number}>({x: 0, y: 0})

  useLayoutEffect(() => {
    const unsubscribeFromChanges = obj.onValuesChange((newValues) => {
      setPos(newValues.position)
    })
    return unsubscribeFromChanges
  }, [id])

  const [divRef, setDivRef] = useState<HTMLElement | null>(null)

  const dragOpts = useMemo((): UseDragOpts => {
    let scrub: IScrub | undefined
    let initial: typeof obj.value.position
    let firstOnDragCalled = false
    return {
      onDragStart() {
        scrub = studio.scrub()
        initial = obj.value.position
        firstOnDragCalled = false
      },
      onDrag(x, y) {
        if (!firstOnDragCalled) {
          studio.setSelection([obj])
          firstOnDragCalled = true
        }
        scrub!.capture(({set}) => {
          set(obj.props.position, {
            x: x + initial.x,
            y: y + initial.y,
            z: 0,
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
        left: '20vw',
        right: '20vw',
        top: 0,
        bottom: '30vh',
        background: 'black',
        display: 'none',
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
          selection={selection ?? []}
        />
      ))}
    </div>
  )
}
