import * as React from 'react'

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 10.5L4 6.654 5.2 5.5 8 8.385 10.8 5.5 12 6.654 8 10.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default ChevronDown
