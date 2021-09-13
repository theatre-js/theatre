import styled from 'styled-components'

const BasicStringInput = styled.input.attrs({type: 'text'})`
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

export default BasicStringInput
