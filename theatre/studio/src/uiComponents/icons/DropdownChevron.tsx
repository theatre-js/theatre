import React from 'react'
import styled from 'styled-components'

/**
 * A chevron icon specifically for dropdowns and elements that open a menu.
 * If you want the chevron to shift down on hover, set `--chevron-down: 1` on the parent element like:
 *
 * ```tsx
 * const Container = styled.div`
 *  &:hover {
 *   --chevron-down: 1;
 * }
 * `
 * ```
 */
const DropdownChevron = React.forwardRef<HTMLDivElement, {}>(
  function DropdownChevron(props, ref) {
    return (
      <Container ref={ref} {...props}>
        {icon}
      </Container>
    )
  },
)

const Container = styled.div`
  color: #aaaaaa;
  transition: all 0.12s;

  transform: translateY(calc(2px * var(--chevron-down, 0)));
`

const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="11"
    viewBox="0 0 10 11"
    fill="none"
  >
    <path
      d="M2.49878 3.94232L4.99878 6.44232L7.49878 3.94232"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default DropdownChevron
