import * as React from 'react'

function Camera(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.767 5.75a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5zM6.017 8.5a1.75 1.75 0 113.5 0 1.75 1.75 0 01-3.5 0z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.773 2.25a.5.5 0 00-.416.223l-.85 1.277H2.782a1.496 1.496 0 00-1.497 1.5v7a1.501 1.501 0 001.497 1.5h9.972a1.496 1.496 0 001.498-1.5v-7a1.501 1.501 0 00-1.498-1.5h-1.726l-.849-1.277a.5.5 0 00-.416-.223H5.773zm-.58 2.277L6.04 3.25h3.453l.849 1.277a.5.5 0 00.416.223h1.994a.496.496 0 01.498.5v7a.501.501 0 01-.498.5H2.781a.495.495 0 01-.497-.5v-7a.501.501 0 01.497-.5h1.995a.5.5 0 00.416-.223z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Camera
