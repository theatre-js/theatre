import {clamp, isInteger, round} from 'lodash-es'
import type {MutableRefObject} from 'react'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import DraggableArea from '@theatre/studio/uiComponents/DraggableArea2'
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
}> = (propsA) => {
  const [stateRef] = useRefAndState<IState>({mode: 'noFocus'})

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

  const callbacks = useMemo(() => {
    const isValid = propsA.isValid ?? alwaysValid

    const inputChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = stateRef.current as IState_EditingViaKeyboard

      stateRef.current = {
        ...curState,
        currentEditedValueInString: value,
      }

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
        // Start editing
        const curValue = propsRef.current.value
        stateRef.current = {
          mode: 'editingViaKeyboard',
          currentEditedValueInString: String(curValue),
          valueBeforeEditing: curValue,
        }

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
    }

    let inputWidth: number

    const onDragEnd = (happened: boolean) => {
      if (!happened) {
        propsRef.current.discardTemporaryValue()
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

      if (stateRef.current.mode !== 'dragging') {
        inputWidth = inputRef.current?.getBoundingClientRect().width!
      }

      const currentDraggingValue =
        curState.currentDraggingValue ?? propsRef.current.value

      let newValue =
        currentDraggingValue +
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
        mode: 'dragging',
      }

      propsRef.current.temporarilySetValue(newValue)
    }

    return {
      inputChange,
      onBlur,
      onInputKeyDown,
      onClick,
      onDragEnd,
      onDrag,
    }
  }, []) // TODO: fix the missing dependency warning

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
      ref={mergeRefs(_refs)}
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
        onDragEnd={callbacks.onDragEnd}
        onDrag={callbacks.onDrag}
        lockCursorTo="ew-resize"
        onClick={callbacks.onClick}
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
