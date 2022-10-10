import * as React from 'react'

function Ellipsis(props: React.SVGProps<SVGSVGElement>) {
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
        d="M.166 7.994a2.26 2.26 0 114.518 0 2.26 2.26 0 01-4.518 0zM2.425 6.91a1.085 1.085 0 100 2.17 1.085 1.085 0 000-2.17zM5.74 7.994a2.26 2.26 0 114.519 0 2.26 2.26 0 01-4.519 0zM8 6.91a1.085 1.085 0 100 2.17 1.085 1.085 0 000-2.17zM13.575 5.735a2.26 2.26 0 100 4.519 2.26 2.26 0 000-4.52zm-1.086 2.26a1.085 1.085 0 112.171 0 1.085 1.085 0 01-2.17 0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Ellipsis
