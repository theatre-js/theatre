import * as React from 'react'

function Trash(props: React.SVGProps<SVGSVGElement>) {
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
        d="M6.8 11.6a.6.6 0 00.6-.6V7.4a.6.6 0 00-1.2 0V11a.6.6 0 00.6.6zm6-7.2h-2.4v-.6A1.8 1.8 0 008.6 2H7.4a1.8 1.8 0 00-1.8 1.8v.6H3.2a.6.6 0 100 1.2h.6v6.6A1.8 1.8 0 005.6 14h4.8a1.8 1.8 0 001.8-1.8V5.6h.6a.6.6 0 100-1.2zm-6-.6a.6.6 0 01.6-.6h1.2a.6.6 0 01.6.6v.6H6.8v-.6zm4.2 8.4a.6.6 0 01-.6.6H5.6a.6.6 0 01-.6-.6V5.6h6v6.6zm-1.8-.6a.6.6 0 00.6-.6V7.4a.6.6 0 00-1.2 0V11a.6.6 0 00.6.6z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Trash
