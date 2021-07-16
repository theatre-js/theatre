import {theme} from '@theatre/studio/css'
import {darken, lighten} from 'polished'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import {CgSelect} from 'react-icons/all'

const Container = styled.div`
  width: 100%;
  position: relative;
`

const IconContainer = styled.div`
  position: absolute;
  right: 0px;
  top: 0;
  bottom: 0;
  width: 1.5em;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: #6b7280;
`

const Select = styled.select`
  background-color: transparent;
  box-sizing: border-box;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.85);
  padding: 1px 6px;
  font: inherit;
  outline: none;
  text-align: left;
  width: 100%;
  height: calc(100% - 4px);
  border-radius: 2px;

  color-adjust: exact;
  appearance: none;

  &:hover,
  &:focus {
    background-color: ${darken(0.9, theme.panel.bg)};
    border: 1px solid ${lighten(0.1, theme.panel.bg)};
  }
`

const BasicSelect: React.FC<{
  value: string
  onChange: (val: string) => void
  options: Record<string, string>
  className?: string
}> = ({value, onChange, options, className}) => {
  const _onChange = useCallback(
    (el: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(String(el.target.value))
    },
    [onChange],
  )
  return (
    <Container>
      <Select className={className} value={value} onChange={_onChange}>
        {Object.keys(options).map((key, i) => (
          <option key={'option-' + i} value={key}>
            {options[key]}
          </option>
        ))}
      </Select>
      <IconContainer>
        <CgSelect />
      </IconContainer>
    </Container>
  )
}

export default BasicSelect
