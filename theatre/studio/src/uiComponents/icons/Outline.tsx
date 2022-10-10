import * as React from 'react'

function Outline(props: React.SVGProps<SVGSVGElement>) {
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
        d="M1.775 2.781a.5.5 0 01.5.5v1.7H4.67c.108-.957.92-1.7 1.905-1.7h6.608a1.917 1.917 0 110 3.834H6.574c-.78 0-1.452-.466-1.751-1.135H2.275v5.03h2.39a2.032 2.032 0 012.023-1.854h6.38a2.031 2.031 0 110 4.063h-6.38c-.83 0-1.543-.497-1.858-1.21H1.775a.5.5 0 01-.5-.5V3.281a.5.5 0 01.5-.5zm4.799 1.5h6.608a.917.917 0 110 1.834H6.574a.917.917 0 110-1.834zm.114 5.875h6.38a1.031 1.031 0 110 2.063h-6.38a1.032 1.032 0 110-2.063z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Outline
