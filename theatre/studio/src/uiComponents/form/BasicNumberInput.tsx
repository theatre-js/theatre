import {theme} from '@theatre/studio/css'
import {clamp, isInteger, round} from 'lodash-es'
import {darken, lighten} from 'polished'
import type {MutableRefObject} from 'react'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import DraggableArea from '@theatre/studio/uiComponents/DraggableArea'
import mergeRefs from 'react-merge-refs'

type IMode = IState['mode']

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

  /* &:hover,
  &:focus,
  ${Container}.dragging > & {
    background: ${darken(0.9, theme.panel.bg)};
    border: 1px solid ${lighten(0.1, theme.panel.bg)};
  } */

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
}> = (propsA) => {
  const [stateA, setState] = useState<IState>({mode: 'noFocus'})
  const isValid = propsA.isValid ?? alwaysValid

  const refs = useRef({state: stateA, props: propsA})
  refs.current = {state: stateA, props: propsA}

  const inputRef = useRef<HTMLInputElement | null>(null)

  const bodyCursorBeforeDrag = useRef<string | null>(null)

  const callbacks = useMemo(() => {
    const inputChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = refs.current.state as IState_EditingViaKeyboard

      setState({...curState, currentEditedValueInString: value})

      const valInFloat = parseFloat(value)
      if (!isFinite(valInFloat) || !isValid(valInFloat)) return

      refs.current.props.temporarilySetValue(valInFloat)
    }

    const onBlur = () => {
      if (refs.current.state.mode === 'editingViaKeyboard') {
        commitKeyboardInput()
        setState({mode: 'noFocus'})
      }
      if (propsA.onBlur) propsA.onBlur()
    }

    const commitKeyboardInput = () => {
      const curState = refs.current.state as IState_EditingViaKeyboard
      const value = parseFloat(curState.currentEditedValueInString)

      if (!isFinite(value) || !isValid(value)) {
        refs.current.props.discardTemporaryValue()
      } else {
        if (curState.valueBeforeEditing === value) {
          refs.current.props.discardTemporaryValue()
        } else {
          refs.current.props.permenantlySetValue(value)
        }
      }
    }

    const onInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        refs.current.props.discardTemporaryValue()
        inputRef.current!.blur()
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        commitKeyboardInput()
        inputRef.current!.blur()
      }
    }

    const onClick = (e: React.MouseEvent) => {
      if (refs.current.state.mode === 'noFocus') {
        const c = inputRef.current!
        c.focus()
        e.preventDefault()
        e.stopPropagation()
      } else {
        e.stopPropagation()
      }
    }

    const onFocus = () => {
      if (refs.current.state.mode === 'noFocus') {
        transitionToEditingViaKeyboardMode()
      } else if (refs.current.state.mode === 'editingViaKeyboard') {
      }
    }

    const transitionToEditingViaKeyboardMode = () => {
      const curValue = refs.current.props.value
      setState({
        mode: 'editingViaKeyboard',
        currentEditedValueInString: String(curValue),
        valueBeforeEditing: curValue,
      })

      setTimeout(() => {
        inputRef.current!.focus()
        inputRef.current!.setSelectionRange(0, 100)
      })
    }

    const transitionToDraggingMode = () => {
      const curValue = refs.current.props.value

      setState({
        mode: 'dragging',
        valueBeforeDragging: curValue,
        currentDraggingValue: curValue,
      })

      bodyCursorBeforeDrag.current = document.body.style.cursor
    }

    const onDragEnd = (happened: boolean) => {
      if (!happened) {
        refs.current.props.discardTemporaryValue()
        setState({mode: 'noFocus'})

        inputRef.current!.focus()
        inputRef.current!.setSelectionRange(0, 100)
      } else {
        const curState = refs.current.state as IState_Dragging
        const value = curState.currentDraggingValue
        if (curState.valueBeforeDragging === value) {
          refs.current.props.discardTemporaryValue()
        } else {
          refs.current.props.permenantlySetValue(value)
        }
        setState({mode: 'noFocus'})
      }
    }

    const onDrag = (dx: number, _dy: number) => {
      const curState = refs.current.state as IState_Dragging
      const newValue = curState.valueBeforeDragging + dx

      setState({
        ...curState,
        currentDraggingValue: newValue,
      })

      refs.current.props.temporarilySetValue(newValue)
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
  }, [refs, setState, inputRef])

  let value =
    stateA.mode !== 'editingViaKeyboard'
      ? format(propsA.value)
      : stateA.currentEditedValueInString

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
    <Container className={propsA.className + ' ' + refs.current.state.mode}>
      <DraggableArea
        key="draggableArea"
        onDragStart={callbacks.transitionToDraggingMode}
        onDragEnd={callbacks.onDragEnd}
        onDrag={callbacks.onDrag}
        enabled={refs.current.state.mode !== 'editingViaKeyboard'}
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
