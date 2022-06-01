import * as React from 'react'

function Package(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.339 4.5l-2.055.644 4.451 1.393v2.748l-2.966.928-2.504-.783V6.738l2.42.758 2.055-.644-4.458-1.395L4 5.858v4.463L7.768 11.5 12 10.175V5.646L8.339 4.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Package
