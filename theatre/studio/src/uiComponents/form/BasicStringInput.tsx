import styled from 'styled-components'
import type {MutableRefObject} from 'react';
import { useEffect} from 'react'
import React, {useMemo, useRef} from 'react'
import mergeRefs from 'react-merge-refs'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useOnClickOutside from '@theatre/studio/uiComponents/useOnClickOutside'

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

  &.invalid {
    border-color: red;
  }
`

type IState_NoFocus = {
  mode: 'noFocus'
}

type IState_EditingViaKeyboard = {
  mode: 'editingViaKeyboard'
  currentEditedValueInString: string
  valueBeforeEditing: string
}

type IState = IState_NoFocus | IState_EditingViaKeyboard

const alwaysValid = (v: string) => true

const BasicStringInput: React.FC<{
  value: string
  temporarilySetValue: (v: string) => void
  discardTemporaryValue: () => void
  permanentlySetValue: (v: string) => void
  className?: string
  isValid?: (v: string) => boolean
  inputRef?: MutableRefObject<HTMLInputElement | null>
  /**
   * Called when the user hits Enter. One of the *SetValue() callbacks will be called
   * before this, so use this for UI purposes such as closing a popover.
   */
  onBlur?: () => void
  autoFocus?: boolean
}> = (props) => {
  const [stateRef] = useRefAndState<IState>({mode: 'noFocus'})
  const isValid = props.isValid ?? alwaysValid

  const propsRef = useRef(props)
  propsRef.current = props

  const inputRef = useRef<HTMLInputElement | null>(null)

  useOnClickOutside(
    inputRef.current,
    () => {
      inputRef.current!.blur()
    },
    stateRef.current.mode === 'editingViaKeyboard',
  )

  const callbacks = useMemo(() => {
    const inputChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = stateRef.current as IState_EditingViaKeyboard

      stateRef.current = {...curState, currentEditedValueInString: value}

      if (!isValid(value)) return

      propsRef.current.temporarilySetValue(value)
    }

    const onBlur = () => {
      if (stateRef.current.mode === 'editingViaKeyboard') {
        commitKeyboardInput()
        stateRef.current = {mode: 'noFocus'}
      }
      propsRef.current.onBlur?.()
    }

    const commitKeyboardInput = () => {
      const curState = stateRef.current as IState_EditingViaKeyboard
      const value = curState.currentEditedValueInString

      if (!isValid(value)) {
        propsRef.current.discardTemporaryValue()
      } else {
        if (curState.valueBeforeEditing === value) {
          propsRef.current.discardTemporaryValue()
        } else {
          propsRef.current.permanentlySetValue(value)
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
      })
    }

    return {
      inputChange,
      onBlur,
      onInputKeyDown,
      onClick,
      onFocus,
    }
  }, [])

  // Call onBlur on unmount. Because technically it _is_ a blur, but also, otherwise edits wouldn't be committed.
  useEffect(() => {
    return () => {
      callbacks.onBlur()
    }
  }, [])

  let value =
    stateRef.current.mode !== 'editingViaKeyboard'
      ? format(props.value)
      : stateRef.current.currentEditedValueInString

  const _refs = [inputRef]
  if (props.inputRef) _refs.push(props.inputRef)

  const theInput = (
    <Input
      key="input"
      type="text"
      className={`${props.className ?? ''} ${!isValid(value) ? 'invalid' : ''}`}
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
      autoFocus={props.autoFocus}
    />
  )

  return theInput
}

function format(v: string): string {
  return v
}

export default BasicStringInput
