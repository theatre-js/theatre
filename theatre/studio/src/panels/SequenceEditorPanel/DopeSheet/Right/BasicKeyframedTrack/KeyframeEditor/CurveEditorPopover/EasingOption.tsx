import BasicTooltip from '@theatre/studio/uiComponents/Popover/BasicTooltip'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import React from 'react'
import styled from 'styled-components'
import {bezierPointsFromString} from './shared'
import SVGCurveSegment from './SVGCurveSegment'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  overflow: hidden;
  aspect-ratio: 1;

  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 4px;
  cursor: pointer;

  // The candidate preset is going to be applied when enter is pressed

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgb(78, 134, 136);
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
    <Wrapper ref={mergeRefs(tooltipHostRef, ref)} {...props}>
      {tooltip}
      <SVGCurveSegment easing={bezierPointsFromString(props.easing.value)} />
      {/* <span>
                    {useQuery ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: fuzzySort.highlight(
                            presetSearchResults[index] as any,
                          )!,
                        }}
                      />
                    ) : (
                      preset.label
                    )}
                  </span> */}
    </Wrapper>
  )
})

export default EasingOption

function mergeRefs<T = any>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}
