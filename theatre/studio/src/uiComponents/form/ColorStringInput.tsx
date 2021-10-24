import styled from 'styled-components'
import type {MutableRefObject} from 'react'
import React, {useMemo, useRef, useState} from 'react'
import mergeRefs from 'react-merge-refs'
import {validHex} from '@theatre/shared/utils/colors'

const Input = styled.input.attrs({type: 'text'})`
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.9);
  padding: 1px 6px;
  font: inherit;
  outline: none;
  cursor: text;
  text-align: left;
  width: 100%;
  height: calc(100% - 4px);
  border-radius: 2px;
  border: 1px solid transparent;
  box-sizing: border-box;

  &:hover {
    background-color: #10101042;
    border-color: #00000059;
  }

  &:hover,
  &:focus {
    cursor: text;
    background-color: #10101042;
    border-color: #00000059;
  }
`

type IState_NoFocus = {
  mode: 'noFocus'
}

type IState_EditingViaKeyboard = {
  mode: 'editingViaKeyboard'
  currentEditedValue: string
  valueBeforeEditing: string
}

type IState = IState_NoFocus | IState_EditingViaKeyboard

const ColorStringInput: React.FC<{
  value: string
  temporarilySetValue: (v: string) => void
  discardTemporaryValue: () => void
  permenantlySetValue: (v: string) => void
  className?: string
  isValid?: (v: string) => boolean
  inputRef?: MutableRefObject<HTMLInputElement | null>
  /**
   * Called when the user hits Enter. One of the *SetValue() callbacks will be called
   * before this, so use this for UI purposes such as closing a popover.
   */
  onBlur?: () => void
}> = (propsA) => {
  const [stateA, setState] = useState<IState>({mode: 'noFocus'})
  const isValid = propsA.isValid ?? validHex

  const refs = useRef({state: stateA, props: propsA})
  refs.current = {state: stateA, props: propsA}

  const inputRef = useRef<HTMLInputElement | null>(null)

  const callbacks = useMemo(() => {
    const inputChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const value = target.value
      const curState = refs.current.state as IState_EditingViaKeyboard

      setState({...curState, currentEditedValue: value})

      if (!isValid(value)) return

      refs.current.props.temporarilySetValue(value)
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
      const value = curState.currentEditedValue

      if (!isValid(value)) {
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
        currentEditedValue: String(curValue),
        valueBeforeEditing: curValue,
      })

      setTimeout(() => {
        inputRef.current!.focus()
      })
    }

    return {
      inputChange,
      onBlur,
      onInputKeyDown,
      onClick,
      onFocus,
    }
  }, [refs, setState, inputRef])

  let value =
    stateA.mode !== 'editingViaKeyboard'
      ? format(propsA.value)
      : stateA.currentEditedValue

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

  return theInput
}

function format(v: string): string {
  return v
}

export default ColorStringInput
