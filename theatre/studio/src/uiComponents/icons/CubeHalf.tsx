import * as React from 'react'

function CubeHalf(props: React.SVGProps<SVGSVGElement>) {
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
        d="M13.988 4.05L8.488.958a1.015 1.015 0 00-.975 0l-5.5 3.094c-.286.161-.514.533-.513.868v6.163c0 .356.202.7.513.875l5.5 3.094c.3.164.671.168.975 0l5.5-3.094c.31-.175.511-.519.512-.875V4.919c.002-.327-.223-.705-.512-.868zM8.056 7.427l-5.031-2.8L8 1.826l4.981 2.8-4.925 2.8zm5.444 3.656l-4.994 2.813.05-5.6L13.5 5.481v5.6z"
        fill="currentColor"
      />
    </svg>
  )
}

export default CubeHalf
