import styled from 'styled-components'

const DetailPanelButton = styled.button<{disabled?: boolean}>`
  text-align: center;
  padding: 8px;
  border-radius: 2px;
  border: 1px solid #627b7b87;
  background-color: #4b787d3d;
  color: #eaeaea;
  font-weight: 400;
  display: block;
  appearance: none;
  flex-grow: 1;
  cursor: ${(props) => (props.disabled ? 'none' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};

  &:hover {
    background-color: #7dc1c878;
    border-color: #9ebcbf;
  }
`

export default DetailPanelButton
