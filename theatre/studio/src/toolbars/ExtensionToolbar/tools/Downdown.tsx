import React, {useState} from 'react'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {
  ToolConfigDowndown,
  ToolConfigDowndownOption,
} from '@theatre/studio/TheatreStudio'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'

const Container = styled.div`
  ${pointerEventsAutoInNormalMode};
  & > svg {
    width: 1em;
    height: 1em;
    pointer-events: none;
  }
`

const DropdownItem = styled.li`
  width: max-content;
  & > button {
    color: #fff;
    font-size: 12px;
    font-weight: normal;
    padding: 0 9px;
    width: fit-content;
  }
  & > .selected {
    border-color: white;
  }
`

const Downdown: React.FC<{
  config: ToolConfigDowndown
}> = ({config}) => {
  const [currentIndex, setCurrentIndex] = useState(
    config.index !== undefined ? config.index : -1,
  )
  const [showOptions, setShowOptions] = useState(false)

  const toggleOptions = () => {
    setShowOptions(!showOptions)
  }

  const selectOption = (index: number, option: ToolConfigDowndownOption) => {
    if (config.selectable) {
      if (index !== currentIndex) {
        config.onChange(option.value)
        setCurrentIndex(index)
      } else {
        config.onChange(null)
        setCurrentIndex(-1)
      }
    } else {
      config.onChange(option.value)
    }
    setShowOptions(false)
  }

  return (
    <Container>
      <ToolbarIconButton onClick={toggleOptions}>
        {config.svgSource}
      </ToolbarIconButton>
      {showOptions && (
        <ul>
          {config.options.map(
            (option: ToolConfigDowndownOption, index: number) => (
              <DropdownItem key={index}>
                <ToolbarIconButton
                  onClick={() => selectOption(index, option)}
                  className={index === currentIndex ? 'selected' : ''}
                >
                  {option.label}
                </ToolbarIconButton>
              </DropdownItem>
            ),
          )}
        </ul>
      )}
    </Container>
  )
}

export default Downdown
