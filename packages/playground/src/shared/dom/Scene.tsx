import studio from '@theatre/studio'
import type {UseDragOpts} from './useDrag'
import useDrag from './useDrag'
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react'
import type {IProject, ISheet} from '@theatre/core'
import {onChange, types} from '@theatre/core'
import type {IScrub, IStudio} from '@theatre/studio'
import type {ShorthandCompoundPropsToInitialValue} from '@theatre/core/propTypes/internals'

const textInterpolate = (left: string, right: string, progression: number) => {
  if (!left || right.startsWith(left)) {
    const length = Math.floor(
      Math.max(0, (right.length - left.length) * progression),
    )
    return left + right.slice(left.length, left.length + length)
  }
  return left
}

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

const boxObjectConfig = {
  test: types.string('Hello?', {interpolate: textInterpolate}),
  testLiteral: types.stringLiteral('a', {a: 'Option A', b: 'Option B'}),
  bool: types.boolean(false),
  favoriteFood: types.compound({
    name: types.string('Pie'),
    // if needing more compounds, consider adding weight with different units
    price: types.compound({
      currency: types.stringLiteral('USD', {USD: 'USD', EUR: 'EUR'}),
      amount: types.number(10, {range: [0, 1000], label: '$'}),
    }),
  }),
  pos: {
    x: types.number(200),
    y: types.number(200),
  },
  color: types.rgba({r: 1, g: 0, b: 0, a: 1}),
}

// this can also be inferred with
type _State = ShorthandCompoundPropsToInitialValue<typeof boxObjectConfig>
type State = {
  pos: {
    x: number
    y: number
  }
  test: string
  testLiteral: string
  bool: boolean
  // a compound compound prop
  favoriteFood: {
    name: string
    price: {
      amount: number
      currency: string
    }
  }
  color: {
    r: number
    g: number
    b: number
    a: number
  }
}

const Box: React.FC<{
  id: string
  sheet: ISheet
  selection: IStudio['selection']
}> = ({id, sheet, selection}) => {
  const defaultConfig = useMemo(
    () =>
      Object.assign({}, boxObjectConfig, {
        // give the box initial values offset from each other
        pos: {
          x: ((id.codePointAt(0) ?? 0) % 15) * 100,
          y: ((id.codePointAt(0) ?? 0) % 15) * 100,
        },
      }),
    [id],
  )

  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object(id, defaultConfig)

  const isSelected = selection.includes(obj)

  const boxRef = useRef<HTMLDivElement>(null!)
  const preRef = useRef<HTMLPreElement>(null!)
  const colorRef = useRef<HTMLDivElement>(null!)

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(obj.props, (newValues) => {
      boxRef.current.style.transform = `translate(${newValues.pos.x}px, ${newValues.pos.y}px)`
      preRef.current.innerText = JSON.stringify(newValues, null, 2)
      colorRef.current.style.background = newValues.color.toString()
    })
    return unsubscribeFromChanges
  }, [])

  const dragOpts = useMemo((): UseDragOpts => {
    let scrub: IScrub | undefined
    let initial: typeof obj.value.pos
    let firstOnDragCalled = false
    return {
      onDragStart() {
        scrub = studio.scrub()
        initial = obj.value.pos
        firstOnDragCalled = false
      },
      onDrag(x, y) {
        if (!firstOnDragCalled) {
          studio.setSelection([obj])
          firstOnDragCalled = true
        }
        scrub!.capture(({set}) => {
          set(obj.props.pos, {
            ...initial,
            x: x + initial.x,
            y: y + initial.y,
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

  useDrag(boxRef.current, dragOpts)

  return (
    <div
      onClick={() => {
        studio.setSelection([obj])
      }}
      ref={boxRef}
      style={{
        width: 300,
        height: 300,
        color: 'white',
        position: 'absolute',
        boxSizing: 'border-box',
        border: isSelected ? '1px solid #5a92fa' : '1px solid white',
      }}
    >
      <pre style={{margin: 0, padding: '1rem'}} ref={preRef}></pre>
      <div
        ref={colorRef}
        style={{
          height: 50,
        }}
      />
    </div>
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
  }, [])

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
    >
      <button
        style={{
          top: '16px',
          left: '60px',
          position: 'absolute',
          padding: '.25rem .5rem',
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
          id={`Box / ${id}`}
          sheet={sheet}
          selection={selection ?? []}
        />
      ))}
    </div>
  )
}
