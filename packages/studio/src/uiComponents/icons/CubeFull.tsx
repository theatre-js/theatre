import * as React from 'react'

function CubeFull(props: React.SVGProps<SVGSVGElement>) {
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
        d="M2.135 4.253l5.968 3.241 5.746-3.241-5.252-3.064a1 1 0 00-.993-.008L2.135 4.253zM7.586 14.947V8.338l-5.922-3.25v5.918a1 1 0 00.507.87l5.415 3.071zM8.414 14.947V8.338l5.922-3.25v5.918a1 1 0 01-.507.87l-5.415 3.071z"
        fill="currentColor"
      />
    </svg>
  )
}

export default CubeFull
