import * as React from 'react'

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10.45 2.266l.956.954-4.763 4.763 4.763 4.762-.955.954-5.712-5.716 5.712-5.717z"
        fill="currentColor"
      />
    </svg>
  )
}

export default ChevronLeft
