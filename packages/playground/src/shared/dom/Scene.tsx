import studio from '@theatre/studio'
import type {UseDragOpts} from './useDrag'
import useDrag from './useDrag'
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react'
import type {IProject, ISheet} from '@theatre/core'
import {onChange, types} from '@theatre/core'
import type {IScrub, IStudio} from '@theatre/studio'
import type {ShorthandCompoundPropsToInitialValue} from '@theatre/core/propTypes/internals'

studio.initialize({usePersistentStorage: false})

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
  x: types.number(200),
  y: types.number(200),
  color: types.rgba({r: 1, g: 0, b: 0, a: 1}),
}

// this can also be inferred with
type _State = ShorthandCompoundPropsToInitialValue<typeof boxObjectConfig>
type State = {
  x: number
  y: number
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
  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object(id, boxObjectConfig)

  const isSelected = selection.includes(obj)

  const [state, setState] = useState<State>(obj.value)

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

  useDrag(divRef, dragOpts)

  return (
    <div
      onClick={() => {
        studio.setSelection([obj])
      }}
      ref={setDivRef}
      style={{
        width: 300,
        height: 300,
        color: 'white',
        position: 'absolute',
        left: state.x + 'px',
        top: state.y + 'px',
        boxSizing: 'border-box',
        border: isSelected ? '1px solid #5a92fa' : '1px solid white',
      }}
    >
      <pre style={{margin: 0, padding: '1rem'}}>
        {JSON.stringify(state, null, 4)}
      </pre>
      <div
        style={{
          height: 50,
          background: state.color.toString(),
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
  })

  const containerRef = useRef<HTMLDivElement>(null!)

  const globalObj = sheet.object('global', globalConfig)

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(globalObj.props, (newValues) => {
      console.log(newValues)
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
