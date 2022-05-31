import * as React from 'react'

function DoubleChevronRight(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3.694 3.765l.792-.792 4.74 4.744-4.74 4.744-.792-.793 3.951-3.951-3.951-3.952zm3.932 0l.792-.792 4.74 4.744-4.74 4.744-.792-.793 3.952-3.951-3.952-3.952z"
        fill="currentColor"
      />
    </svg>
  )
}

export default DoubleChevronRight
