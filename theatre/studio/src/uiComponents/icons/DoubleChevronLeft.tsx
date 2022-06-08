import * as React from 'react'

function DoubleChevronLeft(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.732 4.048l-.792-.792L7.2 8l4.74 4.744.792-.792L8.781 8l3.951-3.952zm-3.932 0l-.792-.792L3.268 8l4.74 4.744.792-.792L4.848 8 8.8 4.048z"
        fill="currentColor"
      />
    </svg>
  )
}

export default DoubleChevronLeft
