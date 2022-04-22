import BasicTooltip from '@theatre/studio/uiComponents/Popover/BasicTooltip'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import React from 'react'
import styled from 'styled-components'
import {handlesFromCssCubicBezierArgs} from './shared'
import SVGCurveSegment from './SVGCurveSegment'
import mergeRefs from 'react-merge-refs'
import {COLOR_BASE, COLOR_FOCUS_OUTLINE} from './colors'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1;

  background: ${COLOR_BASE};
  border-radius: 2px;
  cursor: pointer;

  // The candidate preset is going to be applied when enter is pressed

  &:focus {
    outline: none;
    border: 1px solid ${COLOR_FOCUS_OUTLINE};
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

type IProps = {
  easing: {
    label: string
    value: string
  }
} & Parameters<typeof Wrapper>[0]

const EasingOption: React.FC<IProps> = React.forwardRef((props, ref) => {
  const [tooltip, tooltipHostRef] = useTooltip({enabled: true}, () => (
    <BasicTooltip>{props.easing.label}</BasicTooltip>
  ))

  return (
    <Wrapper ref={mergeRefs([tooltipHostRef, ref])} {...props}>
      {tooltip}
      <SVGCurveSegment
        easing={handlesFromCssCubicBezierArgs(props.easing.value)}
      />
      {/* In the past we used `dangerouslySetInnerHTML={{ _html: fuzzySort.highlight(presetSearchResults[index])}}` 
          to display the name of the easing option, including an underline for the parts of it matching the search
          query. */}
    </Wrapper>
  )
})

export default EasingOption
