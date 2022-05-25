import styled from 'styled-components'
import {Group} from 'reakit'

const Container = styled(Group)`
  display: flex;
  height: fit-content;
  backdrop-filter: blur(14px);
  border-radius: 2px;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.25))
    drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.15));
`

export default Container
