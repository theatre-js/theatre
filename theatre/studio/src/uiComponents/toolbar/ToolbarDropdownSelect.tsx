import React from 'react'
import styled from 'styled-components'

const Container = styled.div``

const ToolbarDropdownSelect: React.FC<{
  value: string
  options: Array<{label: string; value: string; icon: React.ReactElement}>
  onChange: (value: string) => void
  label: (cur: {label: string; value: string}) => string
}> = (props) => {
  return <Container></Container>
}

export default ToolbarDropdownSelect
