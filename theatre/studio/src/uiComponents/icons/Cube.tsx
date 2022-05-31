import * as React from 'react'

function Cube(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.51.953L2.01 4.046c-.314.178-.51.51-.511.87v6.168c.002.354.202.695.51.87l5.5 3.093c.298.171.682.171.98 0l5.5-3.093c.308-.175.508-.516.51-.87V4.919a1.008 1.008 0 00-.51-.872L8.49.953a1.003 1.003 0 00-.98 0zm5.474 3.674L8 1.824l-4.977 2.8 5.03 2.804 4.93-2.8zM2.5 5.477v5.605l5.007 2.816.047-5.604L2.5 5.477zm6.007 8.414l4.99-2.807.003-5.6-4.946 2.81-.047 5.597z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Cube
