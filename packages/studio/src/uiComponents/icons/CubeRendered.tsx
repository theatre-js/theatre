import * as React from 'react'

function CubeRendered(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.202 2.973l-2.92 1.58 2.714 1.58 2.817-1.58-2.61-1.58zM3.532 10.555v-3.22l3.031 1.72v3l-3.03-1.5zM12.532 10.555v-3.22l-3.031 1.72v3l3.031-1.5z"
        fill="#fff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.51.955c.298-.171.682-.171.98 0l5.5 3.093c.315.179.508.51.51.87v6.165a1.024 1.024 0 01-.51.873l-5.5 3.093a1.003 1.003 0 01-.98 0L2.01 11.957a1.025 1.025 0 01-.511-.874V4.918c.002-.355.203-.696.51-.87L7.51.955zm.49.871l4.982 2.802-4.928 2.8-5.03-2.803L8 1.826zm-5.5 9.255V5.477l5.054 2.817-.047 5.606L2.5 11.08zm6.007 2.812l4.99-2.807.003-5.602-4.946 2.81-.047 5.599z"
        fill="currentColor"
      />
    </svg>
  )
}

export default CubeRendered
