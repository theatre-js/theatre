import React, {
  useLayoutEffect,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react'
import type {MutableRefObject} from 'react'
import {clamp, isInteger, round} from 'lodash-es'
import styled from 'styled-components'
import DraggableArea from '@theatre/studio/uiComponents/DraggableArea'
import mergeRefs from 'react-merge-refs'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useOnClickOutside from '@theatre/studio/uiComponents/useOnClickOutside'

const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;

  &:after {
    position: absolute;
    inset: 1px 0 2px;
    display: block;
    content: ' ';
    background-color: transparent;
    border: 1px solid transparent;
    z-index: -2;
    box-sizing: border-box;
    border-radius: 1px;
  }

  &:hover,
  &.dragging,
  &.editingViaKeyboard {
    &:after {
      background-color: #10101042;
      border-color: #00000059;
    }
  }
`

const Input = styled.input`
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.9);
  padding: 1px 6px;
  font: inherit;
  outline: none;
  cursor: ew-resize;
  text-align: left;
  width: 100%;
  height: calc(100% - 4px);
  border-radius: 2px;

  &:focus {
    cursor: text;
  }
`

const FillIndicator = styled.div`
  position: absolute;
  inset: 3px 2px 4px;
  transform: scale(var(--percentage), 1);
  transform-origin: top left;
  background-color: #2d5561;
  z-index: -1;
  border-radius: 2px;
  pointer-events: none;

  ${Container}.dragging &, ${Container}.noFocus:hover & {
    background-color: #338198;
  }
`

type IState_NoFocus = {
  mode: 'noFocus'
}

type IState_EditingViaKeyboard = {
  mode: 'editingViaKeyboard'
  currentEditedValueInString: string
  valueBeforeEditing: number
}

type IState_Dragging = {
  mode: 'dragging'
  valueBeforeDragging: number
  currentDraggingValue: number
}

type IState = IState_NoFocus | IState_EditingViaKeyboard | IState_Dragging

const alwaysValid = (v: number) => true

export type BasicNumberInputNudgeFn = (params: {
  deltaX: number
  deltaFraction: number
  magnitude: number
}) => number

const BasicNumberInput: React.FC<{
  value: number
  temporarilySetValue: (v: number) => void
  discardTemporaryValue: () => void
  permenantlySetValue: (v: number) => void
  className?: string
  range?: [min: number, max: number]
  isValid?: (v: number) => boolean
  inputRef?: MutableRefObject<HTMLInputElement | null>
  /**
   * Called when the user hits Enter. One of the *SetValue() callbacks will be called
   * before this, so use this for UI purposes such as closing a popover.
   */
  onBlur?: () => void
  nudge: BasicNumberInputNudgeFn
  defaultMode?: IState['mode']
}> = (propsA) => {
  const isValid = propsA.isValid ?? alwaysValid

  const [inputWidth, setInputWidth] = useState(0)
  const [stateRef] = useRefAndState<IState>({
    mode: 'noFocus',
  })

  const inputRef = useRef<HTMLInputElement | null>(null)

  useOnClickOutside(
    inputRef.current,
    () => {
      inputRef.current!.blur()
    },
    stateRef.current.mode === 'editingViaKeyboard',
  )

  const transitionToEditingViaKeyboardMode = useCallback(() => {
    const curValue = propsA.value
    stateRef.current = {
      mode: 'editingViaKeyboard',
      currentEditedValueInString: String(curValue),
      valueBeforeEditing: curValue,
    }
  }, [propsA.value, stateRef])

  const transitionToDraggingMode = useCallback(() => {
    const curValue = propsA.value
    stateRef.current = {
      mode: 'dragging',
      valueBeforeDragging: curValue,
      currentDraggingValue: curValue,
    }
  }, [propsA.value, stateRef])

  const commitKeyboardInput = useCallback(() => {
    const curState = stateRef.current as IState_EditingViaKeyboard
    const value = parseFloat(curState.currentEditedValueInString)

    if (!isFinite(value) || !isValid(value)) {
      propsA.discardTemporaryValue()
    } else {
      if (curState.valueBeforeEditing === value) {
        propsA.discardTemporaryValue()
      } else {
        propsA.permenantlySetValue(value)
      }
    }
  }, [isValid, propsA, stateRef])

  const onBlur = useCallback(() => {
    if (stateRef.current.mode === 'editingViaKeyboard') {
      commitKeyboardInput()
      stateRef.current = {mode: 'noFocus'}
    }
    if (propsA.onBlur) propsA.onBlur()
  }, [commitKeyboardInput, propsA, stateRef])

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        propsA.discardTemporaryValue()
        stateRef.current = {mode: 'noFocus'}
        inputRef.current!.blur()
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        commitKeyboardInput()
        inputRef.current!.blur()
      }
    },
    [commitKeyboardInput, propsA, stateRef],
  )

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (stateRef.current.mode === 'noFocus') {
        // Start editing
        transitionToEditingViaKeyboardMode()

        const c = inputRef.current!
        c.focus()
        e.preventDefault()
        e.stopPropagation()

        setTimeout(() => {
          c.setSelectionRange(0, 100)
        })
      } else {
        // if clicked again we clear the selection
        window?.getSelection()?.empty()
        e.stopPropagation()
      }
    },
    [stateRef, transitionToEditingViaKeyboardMode],
  )

  const inputChange = useCallback(
    (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = stateRef.current as IState_EditingViaKeyboard

      stateRef.current = {
        ...curState,
        currentEditedValueInString: value,
      }

      const valInFloat = parseFloat(value)

      if (!isFinite(valInFloat) || !isValid(valInFloat)) return

      propsA.temporarilySetValue(valInFloat)
    },
    [isValid, propsA, stateRef],
  )

  const onDragEnd = useCallback(
    (happened: boolean) => {
      if (!happened) {
        propsA.discardTemporaryValue()
      } else {
        const curState = stateRef.current as IState_Dragging
        const value = curState.currentDraggingValue
        if (curState.valueBeforeDragging === value) {
          propsA.discardTemporaryValue()
        } else {
          propsA.permenantlySetValue(value)
        }
        transitionToEditingViaKeyboardMode()
      }
    },
    [transitionToEditingViaKeyboardMode, propsA, stateRef],
  )

  const onDrag = useCallback(
    (deltaX: number, _dy: number) => {
      if (stateRef.current.mode !== 'dragging') {
        transitionToDraggingMode()
      }
      const curState = stateRef.current as IState_Dragging

      let newValue =
        curState.currentDraggingValue +
        propsA.nudge({
          deltaX,
          deltaFraction: deltaX / inputWidth,
          magnitude: 1,
        })

      if (propsA.range) {
        newValue = clamp(newValue, propsA.range[0], propsA.range[1])
      }

      stateRef.current = {
        ...curState,
        currentDraggingValue: newValue,
      }

      propsA.temporarilySetValue(newValue)
    },
    [transitionToDraggingMode, inputWidth, propsA, stateRef],
  )

  useEffect(() => {
    if (stateRef.current.mode) return
    if (propsA?.defaultMode === 'editingViaKeyboard') {
      inputRef.current!.focus()
      transitionToEditingViaKeyboardMode()
    } else if (propsA?.defaultMode === 'dragging') {
      transitionToDraggingMode()
    }
  }, [
    propsA?.defaultMode,
    transitionToEditingViaKeyboardMode,
    transitionToDraggingMode,
    stateRef,
  ])

  useLayoutEffect(() => {
    setInputWidth(inputRef.current?.getBoundingClientRect().width!)
  }, [])

  let value =
    stateRef.current.mode !== 'editingViaKeyboard'
      ? format(propsA.value)
      : stateRef.current.currentEditedValueInString

  if (typeof value === 'number' && isNaN(value)) {
    value = 'NaN'
  }

  const _refs = [inputRef]
  if (propsA.inputRef) _refs.push(propsA.inputRef)

  const {range} = propsA
  const num = parseFloat(value)

  const fillIndicator = range ? (
    <FillIndicator
      style={{
        // @ts-ignore
        '--percentage': clamp((num - range[0]) / (range[1] - range[0]), 0, 1),
      }}
    />
  ) : null

  return (
    <Container className={propsA.className + ' ' + stateRef.current.mode}>
      <DraggableArea
        onDragEnd={onDragEnd}
        onDrag={onDrag}
        lockCursorTo="ew-resize"
        onClick={onClick}
      >
        <Input
          key="input"
          type="text"
          onChange={inputChange}
          value={value}
          onBlur={onBlur}
          onKeyDown={onInputKeyDown}
          ref={mergeRefs(_refs)}
          onDoubleClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      </DraggableArea>
      {fillIndicator}
    </Container>
  )
}

function format(v: number): string {
  return isNaN(v) ? 'NaN' : isInteger(v) ? v.toFixed(0) : round(v, 3).toString()
}

export default BasicNumberInput
