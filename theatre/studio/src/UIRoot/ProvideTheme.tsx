import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  --colors-panel-1: red;
`

const ProvideTheme: React.FC<{}> = (props) => {
  return <Container>{props.children}</Container>
}

export default ProvideTheme
