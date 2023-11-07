import styled from 'styled-components'
import React from 'react'
import type {$IntentionalAny} from '@theatre/utils/types'
import BasicTooltip from './BasicTooltip'

const Container = styled(BasicTooltip)`
  display: flex;
  align-items: center;
  height: 30px;
  position: relative;
`

const Title = styled.div`
  text-wrap: nowrap;
`

const IconContainer = styled.div`
  background: #59595938;
  border-radius: 4px;
  border: 0.5px solid #ffffff1a;
  color: white;
  padding: 4px;
  font-size: 10px;
  /* margin: 0; */
  margin-left: 12px;
  box-shadow: black 0px 2px 8px -4px;
  flex-wrap: nowrap;
`

const TooltipWithIcon: React.FC<{
  className?: string
  children: React.ReactNode
  icon: React.ReactNode
}> = React.forwardRef(({children, icon, className}, ref) => {
  return (
    <Container className={className} ref={ref as $IntentionalAny}>
      <Title>{children}</Title>
      <IconContainer>{icon}</IconContainer>
    </Container>
  )
})

export default TooltipWithIcon
