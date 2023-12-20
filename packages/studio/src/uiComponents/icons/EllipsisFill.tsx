import * as React from 'react'

function EllipsisFill(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.667 8a1.333 1.333 0 112.666 0 1.333 1.333 0 01-2.666 0zm-4 0a1.333 1.333 0 112.666 0 1.333 1.333 0 01-2.666 0zm-4 0a1.333 1.333 0 112.666 0 1.333 1.333 0 01-2.666 0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default EllipsisFill
