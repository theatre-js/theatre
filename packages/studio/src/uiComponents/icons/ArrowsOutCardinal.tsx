import * as React from 'react'

function ArrowsOutCardinal(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8 1a.498.498 0 01.358.15l1.764 1.765a.5.5 0 01-.707.707L8.5 2.707V6a.5.5 0 01-1 0V2.707l-.915.915a.5.5 0 11-.707-.707l1.768-1.769A.498.498 0 018 1zM8 9.5a.5.5 0 01.5.5v3.292l.915-.915a.5.5 0 01.707.707L8.37 14.836a.499.499 0 01-.74.001l-1.752-1.753a.5.5 0 01.707-.707l.915.915V10a.5.5 0 01.5-.5zM3.622 6.584a.5.5 0 10-.707-.707L1.146 7.646a.498.498 0 00.018.724l1.751 1.752a.5.5 0 10.707-.708L2.708 8.5H6a.5.5 0 000-1H2.706l.916-.916zM12.378 5.877a.5.5 0 01.707 0l1.768 1.769a.498.498 0 01-.017.724l-1.751 1.752a.5.5 0 01-.707-.708l.914-.914H10a.5.5 0 010-1h3.294l-.916-.916a.5.5 0 010-.707z"
        fill="currentColor"
      />
    </svg>
  )
}

export default ArrowsOutCardinal
