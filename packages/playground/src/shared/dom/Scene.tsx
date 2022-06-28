import studio from '@theatre/studio'
import type {UseDragOpts} from './useDrag'
import useDrag from './useDrag'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {IProject, ISheetObject} from '@theatre/core'
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
  sheetObject: ISheetObject
  selection: IStudio['selection']
}> = ({sheetObject, selection}) => {
  const isSelected = selection.includes(sheetObject)

  const boxRef = useRef<HTMLDivElement>(null!)
  const preRef = useRef<HTMLPreElement>(null!)
  const colorRef = useRef<HTMLDivElement>(null!)

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(sheetObject.props, (newValues) => {
      boxRef.current.style.transform = `translate(${newValues.x}px, ${newValues.y}px)`
      preRef.current.innerText = JSON.stringify(newValues, null, 2)
      colorRef.current.style.background = newValues.color.toString()
    })
    return unsubscribeFromChanges
  }, [])

  const dragOpts = useMemo((): UseDragOpts => {
    let scrub: IScrub | undefined
    let initial: typeof sheetObject.value
    return {
      onDragStart() {
        scrub = studio.scrub()
        initial = sheetObject.value
      },
      onDrag(x, y) {
        studio.setSelection([sheetObject])

        scrub!.capture(({set}) => {
          set(sheetObject.props, {
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
        studio.setSelection([sheetObject])
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

let lastBoxId = -1
const boxObjectConfigForBoxId = (id: number) => ({
  ...boxObjectConfig,
  // give the box initial values offset from each other
  x: (id % 15) * 100,
  y: (id % 15) * 100,
})

export const Scene: React.FC<{project: IProject}> = ({project}) => {
  const sheet = project.sheet('Scene', 'default')

  const updateBoxes = () =>
    setBoxes(
      sheet
        .allObjects()
        .filter((sheetObject) => sheetObject.address.objectKey !== 'global'),
    )
  const addBox = () => {
    lastBoxId++
    sheet.object(String(lastBoxId), boxObjectConfigForBoxId(lastBoxId))
    updateBoxes()
  }
  const removeBox = () => {
    sheet.deleteObject(String(lastBoxId))
    lastBoxId--
    updateBoxes()
  }

  const [boxes, setBoxes] = useState<ISheetObject[]>([])
  useEffect(() => {
    addBox()
    addBox()
  }, [])
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
        onClick={addBox}
      >
        Add
      </button>
      <button
        style={{
          top: '16px',
          left: '120px',
          position: 'absolute',
          padding: '.25rem .5rem',
        }}
        onClick={removeBox}
      >
        Delete
      </button>
      {boxes.map((sheetObject) => (
        <Box
          key={'box' + sheetObject.address.objectKey}
          sheetObject={sheetObject}
          selection={selection ?? []}
        />
      ))}
    </div>
  )
}
