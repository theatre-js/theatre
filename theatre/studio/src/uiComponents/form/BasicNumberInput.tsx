import {clamp, isInteger, round} from 'lodash-es'
import type {MutableRefObject} from 'react'
import {useState} from 'react'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import mergeRefs from 'react-merge-refs'
import useOnClickOutside from '@theatre/studio/uiComponents/useOnClickOutside'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {IDerivation} from '@theatre/dataverse'
import {Box, prism} from '@theatre/dataverse'
import studioTicker from '@theatre/studio/studioTicker'
import {usePrism} from '@theatre/react'
import {useElementMutation} from '@theatre/studio/uiComponents/useElementMutation'

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
const FakeInput = styled.div`
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.9);
  padding: 1px 6px;
  position: absolute;
  z-index: 1;
  pointer-events: none;
  // center the ::after vertically like inputs do
  display: flex;
  align-items: center;

  &::after {
    content: attr(data-value);
  }

  ${Input}:focus + & {
    display: none;
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

const DragWrap = styled.div`
  display: contents;
`

type IState_NoFocus = {
  mode: 'noFocus'
}

type IState_EditingViaKeyboard = {
  mode: 'editingViaKeyboard'
  currentEditedValueInStringBox: Box<string>
  valueBeforeEditing: number
}

type IState_Dragging = {
  mode: 'dragging'
}

type IState = IState_NoFocus | IState_EditingViaKeyboard | IState_Dragging

const alwaysValid = (v: number) => true

export type BasicNumberInputNudgeFn = (params: {
  deltaX: number
  deltaFraction: number
  magnitude: number
}) => number

const BasicNumberInput: React.VFC<{
  valueD: IDerivation<number>
  temporarilySetValue: (v: number) => void
  discardTemporaryValue: () => void
  permanentlySetValue: (v: number) => void
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
  const _stateRef = useRef<undefined | Box<IState>>(undefined)
  const stateBox = _stateRef.current
    ? _stateRef.current
    : (_stateRef.current = new Box({mode: 'noFocus'} as IState))
  const state = usePrism(() => stateBox.derivation.getValue(), [stateBox])

  const isValid = propsA.isValid ?? alwaysValid

  const propsRef = useRef(propsA)
  propsRef.current = propsA

  const inputRef = useRef<HTMLInputElement | null>(null)

  useOnClickOutside(
    inputRef.current,
    () => {
      inputRef.current!.blur()
    },
    state.mode === 'editingViaKeyboard',
  )

  const bodyCursorBeforeDrag = useRef<string | null>(null)

  // pull all event listeners into one place so we can ensure new functions aren't created
  // on every render causing re-renders.
  const eventListeners = useMemo((): Parameters<typeof Input>[0] => {
    const onChange = (e: React.ChangeEvent) => {
      const target = e.target as HTMLInputElement
      const {value} = target
      const curState = stateBox.get() as IState_EditingViaKeyboard

      curState.currentEditedValueInStringBox.set(value)

      const valInFloat = parseFloat(value)
      if (!isFinite(valInFloat) || !isValid(valInFloat)) return

      propsRef.current.temporarilySetValue(valInFloat)
    }

    const onBlur = () => {
      if (stateBox.get().mode === 'editingViaKeyboard') {
        commitKeyboardInput()
        stateBox.set({mode: 'noFocus'})
      }
      if (propsA.onBlur) propsA.onBlur()

      // when blurred, we can remove the current value (because we'll show the value in the FakeInput which is much more performant to change every frame)
      inputRef.current!.value = ''
    }

    const commitKeyboardInput = () => {
      const curState = stateBox.get() as IState_EditingViaKeyboard
      const value = parseFloat(curState.currentEditedValueInStringBox.get())

      if (!isFinite(value) || !isValid(value)) {
        propsRef.current.discardTemporaryValue()
      } else {
        if (curState.valueBeforeEditing === value) {
          propsRef.current.discardTemporaryValue()
        } else {
          propsRef.current.permanentlySetValue(value)
        }
      }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        propsRef.current.discardTemporaryValue()
        stateBox.set({mode: 'noFocus'})
        inputRef.current!.blur()
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        commitKeyboardInput()
        inputRef.current!.blur()
      }
    }

    const onClick = (e: React.MouseEvent) => {
      if (stateBox.get().mode === 'noFocus') {
        const c = inputRef.current!
        c.focus()
        e.preventDefault()
        e.stopPropagation()
      } else {
        e.stopPropagation()
      }
    }

    const onFocus = () => {
      const mode = stateBox.get().mode

      // while focused, we need to assign the current value
      let value = propsRef.current.valueD.getValue()
      inputRef.current!.value = isNaN(value) ? 'NaN' : String(value)
      inputRef.current!.setSelectionRange(0, 100)

      if (mode === 'noFocus') {
        // no need to focus, we're listening on focus
        transitionToEditingViaKeyboardMode(false)
      }
    }

    const transitionToEditingViaKeyboardMode = (andFocus: boolean) => {
      const curValue = propsRef.current.valueD.getValue()
      stateBox.set({
        mode: 'editingViaKeyboard',
        currentEditedValueInStringBox: new Box(String(curValue)),
        valueBeforeEditing: curValue,
      })

      if (andFocus) {
        setTimeout(() => {
          inputRef.current!.focus()
          inputRef.current!.setSelectionRange(0, 100)
        })
      }
    }

    return {
      onChange,
      onBlur,
      onKeyDown,
      onClick,
      onFocus,
      onMouseDown(e: React.MouseEvent) {
        e.stopPropagation()
      },
      onDoubleClick(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
      },
    }
  }, [])

  const transitionToDraggingMode = useMemo(() => {
    let inputWidth: number
    return function transitionToDraggingMode() {
      const curValue = propsRef.current.valueD
      inputWidth = inputRef.current?.getBoundingClientRect().width!

      stateBox.set({
        mode: 'dragging',
      })

      const valueBeforeDragging = curValue.getValue()
      let valueDuringDragging = valueBeforeDragging

      bodyCursorBeforeDrag.current = document.body.style.cursor

      return {
        // note: we use mx because we need to constrain the `valueDuringDragging`
        // and dx will keep accumulating past any constraints
        onDrag(_dx: number, _dy: number, _e: MouseEvent, mx: number) {
          const newValue =
            valueDuringDragging +
            propsA.nudge({
              deltaX: mx,
              deltaFraction: mx / inputWidth,
              magnitude: 1,
            })

          valueDuringDragging = propsA.range
            ? clamp(newValue, propsA.range[0], propsA.range[1])
            : newValue

          propsRef.current.temporarilySetValue(valueDuringDragging)
        },
        onDragEnd(happened: boolean) {
          if (!happened) {
            propsRef.current.discardTemporaryValue()
            stateBox.set({mode: 'noFocus'})
          } else {
            if (valueBeforeDragging === valueDuringDragging) {
              propsRef.current.discardTemporaryValue()
            } else {
              propsRef.current.permanentlySetValue(valueDuringDragging)
            }
            stateBox.set({mode: 'noFocus'})
          }
        },
        onClick() {
          inputRef.current!.focus()
          inputRef.current!.setSelectionRange(0, 100)
        },
      }
    }
  }, [])

  const valueD = useMemo(
    () =>
      prism(() => {
        const state = stateBox.derivation.getValue()
        let value =
          state.mode !== 'editingViaKeyboard'
            ? format(propsRef.current.valueD.getValue())
            : state.currentEditedValueInStringBox.derivation.getValue()
        if (typeof value === 'number' && isNaN(value)) {
          value = 'NaN'
        }
        return value
      }),
    [stateBox, propsRef.current.valueD],
  )

  const mergedInputRef = useMemo(() => {
    if (propsA.inputRef) return mergeRefs([inputRef, propsA.inputRef])
    else return inputRef
  }, [inputRef, propsA.inputRef])

  const dataValueRef = useElementMutation<HTMLDivElement>((elt) => {
    return valueD.tapImmediate(studioTicker, (value) => {
      elt.dataset.value = value
    })
  })

  const theInput = (
    <Input type="text" key="input" ref={mergedInputRef} {...eventListeners} />
  )

  const range = propsA.range ?? [0, 1]
  const fillIndicatorRef = useElementMutation<HTMLDivElement>(
    (fillIndicator) => {
      return valueD.tapImmediate(studioTicker, (value) => {
        const num = parseFloat(value)
        fillIndicator.style.setProperty(
          '--percentage',
          String(clamp((num - range[0]) / (range[1] - range[0]), 0, 1)),
        )
      })
    },
    [valueD, ...range],
  )

  const fillIndicator = propsA.range ? (
    <FillIndicator ref={fillIndicatorRef} />
  ) : null

  const [dragNode, setDragNode] = useState<HTMLDivElement | null>(null)
  useDrag(dragNode, {
    debugName: 'form/BasicNumberInput',
    onDragStart: transitionToDraggingMode,
    lockCSSCursorTo: 'ew-resize',
    shouldPointerLock: true,
    disabled: state.mode === 'editingViaKeyboard',
  })

  return (
    <Container className={propsA.className + ' ' + state.mode}>
      <DragWrap ref={setDragNode}>
        {theInput}
        <FakeInput ref={dataValueRef} />
      </DragWrap>
      {fillIndicator}
    </Container>
  )
}

function format(v: number): string {
  return isNaN(v) ? 'NaN' : isInteger(v) ? v.toFixed(0) : round(v, 3).toString()
}

export default BasicNumberInput
