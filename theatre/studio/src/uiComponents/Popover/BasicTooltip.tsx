import styled from 'styled-components'
import BasicPopover from './BasicPopover'

const BasicTooltip = styled(BasicPopover)`
  padding: 1em;
  max-width: 240px;
  pointer-events: none !important;
  --popover-outer-stroke: transparent;
  --popover-inner-stroke: #45464d;
`

export default BasicTooltip
