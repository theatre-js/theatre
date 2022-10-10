import * as React from 'react'

function Details(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3.5 3c-1.072 0-1.969.904-1.969 1.969 0 1 .929 1.968 1.969 1.968h9A1.969 1.969 0 1012.5 3h-9zm9 1H5.531v1.938H12.5A.969.969 0 0012.5 4zM3.5 9.14a1.969 1.969 0 000 3.938h9a1.969 1.969 0 100-3.937h-9zm9 1H8.406v1.938H12.5a.969.969 0 100-1.937z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Details
