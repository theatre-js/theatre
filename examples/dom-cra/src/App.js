import studio from '@theatre/studio'
import {useLayoutEffect, useMemo, useState} from 'react'
import {types as t} from '@theatre/core'
import useDrag from './useDrag'

const boxObjectConfig = t.compound({
  x: t.number(0),
  y: t.number(0),
})

const Box = ({id, sheet, selectedObject}) => {
  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object(id, null, boxObjectConfig)

  const isSelected = selectedObject === obj

  const [pos, setPos] = useState({x: 0, y: 0})

  useLayoutEffect(() => {
    const unsubscribeFromChanges = obj.onValuesChange((newValues) => {
      setPos(newValues)
    })
    return unsubscribeFromChanges
  }, [id, obj])

  const [divRef, setDivRef] = useState(null)

  const dragOpts = useMemo(() => {
    let scrub
    let initial
    let firstOnDragCalled = false
    return {
      onDragStart() {
        scrub = studio.scrub()
        initial = obj.value
        firstOnDragCalled = false
      },
      onDrag(x, y) {
        if (!firstOnDragCalled) {
          studio.__experimental_setSelection([obj])
          firstOnDragCalled = true
        }
        scrub.capture(({set}) => {
          set(obj.props, {x: x + initial.x, y: y + initial.y})
        })
      },
      onDragEnd(dragHappened) {
        if (dragHappened) {
          scrub.commit()
        } else {
          scrub.discard()
        }
      },
      lockCursorTo: 'move',
    }
  }, [])

  useDrag(divRef, dragOpts)

  return (
    <div
      onClick={() => {
        studio.__experimental_setSelection([obj])
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

const App = ({project}) => {
  const [boxes, setBoxes] = useState(['0', '1'])

  // This is cheap to call and always returns the same value, so no need for useMemo()
  const sheet = project.sheet('Scene', 'default')
  const [selection, _setSelection] = useState([])

  useLayoutEffect(() => {
    return studio.__experimental_onSelectionChange((newSelection) => {
      _setSelection(newSelection)
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
          selectedObject={selection[0]}
        />
      ))}
    </div>
  )
}

export default App
