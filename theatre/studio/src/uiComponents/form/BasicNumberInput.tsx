import {clamp, isInteger, round} from 'lodash-es'
import type {MutableRefObject} from 'react'
import React, {useMemo, useRef} from 'react'
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

function isFiniteFloat(s: string) {
  return isFinite(parseFloat(s))
}

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
}> = (propsA) => {
  const [stateRef] = useRefAndState<IState>({mode: 'noFocus'})
  const isValid = propsA.isValid ?? alwaysValid

  const propsRef = useRef(propsA)
  propsRef.current = propsA

  const inputRef = useRef<HTMLInputElement | null>(null)

  useOnClickOutside(
    inputRef.current,
    () => {
      inputRef.current!.blur()
    },
    stateRef.current.mode === 'editingViaKeyboard',
  )

  const bodyCursorBeforeDrag = useRef<string | null>(null)

  const callbacks = useMemo(() => {
    const inputChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = stateRef.current as IState_EditingViaKeyboard

      stateRef.current = {...curState, currentEditedValueInString: value}

      const valInFloat = parseFloat(value)
      if (!isFinite(valInFloat) || !isValid(valInFloat)) return

      propsRef.current.temporarilySetValue(valInFloat)
    }

    const onBlur = () => {
      if (stateRef.current.mode === 'editingViaKeyboard') {
        commitKeyboardInput()
        stateRef.current = {mode: 'noFocus'}
      }
      if (propsA.onBlur) propsA.onBlur()
    }

    const commitKeyboardInput = () => {
      const curState = stateRef.current as IState_EditingViaKeyboard
      const value = parseFloat(curState.currentEditedValueInString)

      if (!isFinite(value) || !isValid(value)) {
        propsRef.current.discardTemporaryValue()
      } else {
        if (curState.valueBeforeEditing === value) {
          propsRef.current.discardTemporaryValue()
        } else {
          propsRef.current.permenantlySetValue(value)
        }
      }
    }

    const onInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        propsRef.current.discardTemporaryValue()
        stateRef.current = {mode: 'noFocus'}
        inputRef.current!.blur()
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        commitKeyboardInput()
        inputRef.current!.blur()
      }
    }

    const onClick = (e: React.MouseEvent) => {
      if (stateRef.current.mode === 'noFocus') {
        const c = inputRef.current!
        c.focus()
        e.preventDefault()
        e.stopPropagation()
      } else {
        e.stopPropagation()
      }
    }

    const onFocus = () => {
      if (stateRef.current.mode === 'noFocus') {
        transitionToEditingViaKeyboardMode()
      } else if (stateRef.current.mode === 'editingViaKeyboard') {
      }
    }

    const transitionToEditingViaKeyboardMode = () => {
      const curValue = propsRef.current.value
      stateRef.current = {
        mode: 'editingViaKeyboard',
        currentEditedValueInString: String(curValue),
        valueBeforeEditing: curValue,
      }

      setTimeout(() => {
        inputRef.current!.focus()
        inputRef.current!.setSelectionRange(0, 100)
      })
    }

    let inputWidth: number

    const transitionToDraggingMode = () => {
      const curValue = propsRef.current.value
      inputWidth = inputRef.current?.getBoundingClientRect().width!

      stateRef.current = {
        mode: 'dragging',
        valueBeforeDragging: curValue,
        currentDraggingValue: curValue,
      }

      bodyCursorBeforeDrag.current = document.body.style.cursor
    }

    const onDragEnd = (happened: boolean) => {
      if (!happened) {
        propsRef.current.discardTemporaryValue()
        stateRef.current = {mode: 'noFocus'}

        inputRef.current!.focus()
        inputRef.current!.setSelectionRange(0, 100)
      } else {
        const curState = stateRef.current as IState_Dragging
        const value = curState.currentDraggingValue
        if (curState.valueBeforeDragging === value) {
          propsRef.current.discardTemporaryValue()
        } else {
          propsRef.current.permenantlySetValue(value)
        }
        stateRef.current = {mode: 'noFocus'}
      }
    }

    const onDrag = (deltaX: number, _dy: number) => {
      const curState = stateRef.current as IState_Dragging

      let newValue =
        curState.valueBeforeDragging +
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

      propsRef.current.temporarilySetValue(newValue)
    }

    return {
      inputChange,
      onBlur,
      transitionToDraggingMode,
      onInputKeyDown,
      onClick,
      onFocus,
      onDragEnd,
      onDrag,
    }
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

  const theInput = (
    <Input
      key="input"
      type="text"
      onChange={callbacks.inputChange}
      value={value}
      onBlur={callbacks.onBlur}
      onKeyDown={callbacks.onInputKeyDown}
      onClick={callbacks.onClick}
      onFocus={callbacks.onFocus}
      ref={mergeRefs(_refs)}
      onMouseDown={(e: React.MouseEvent) => {
        e.stopPropagation()
      }}
      onDoubleClick={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    />
  )

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
        key="draggableArea"
        onDragStart={callbacks.transitionToDraggingMode}
        onDragEnd={callbacks.onDragEnd}
        onDrag={callbacks.onDrag}
        enabled={stateRef.current.mode !== 'editingViaKeyboard'}
        lockCursorTo="ew-resize"
      >
        {theInput}
      </DraggableArea>
      {fillIndicator}
    </Container>
  )
}

function format(v: number): string {
  return isNaN(v) ? 'NaN' : isInteger(v) ? v.toFixed(0) : round(v, 3).toString()
}

export default BasicNumberInput
