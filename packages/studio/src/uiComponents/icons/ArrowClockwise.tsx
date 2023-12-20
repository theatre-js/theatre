import * as React from 'react'

function ArrowClockwise(props: React.SVGProps<SVGSVGElement>) {
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
        d="M5.586 3.38a5 5 0 015.45 1.087L12.574 6h-1.572a.5.5 0 000 1h3a.5.5 0 00.5-.5v-3a.5.5 0 10-1 0v2.013l-1.76-1.754a6 6 0 100 8.482.5.5 0 10-.707-.707A5 5 0 115.587 3.38z"
        fill="currentColor"
      />
    </svg>
  )
}

export default ArrowClockwise
