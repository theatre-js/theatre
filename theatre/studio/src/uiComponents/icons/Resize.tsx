import * as React from 'react'

function Resize(props: React.SVGProps<SVGSVGElement>) {
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
        d="M1.452 3.452a2 2 0 012-2h9.096a2 2 0 012 2v9.096a2 2 0 01-2 2H3.452a2 2 0 01-2-2V3.452zm2-1h9.096a1 1 0 011 1v9.096a1 1 0 01-1 1h-5.06V8.511H2.451V3.452a1 1 0 011-1z"
        fill="currentColor"
      />
      <path
        d="M12.501 4.09a.5.5 0 00-.5-.5H8.95a.5.5 0 100 1h1.98l-2.45 2.449a.5.5 0 10.707.707l2.315-2.315v1.627a.5.5 0 001 0V4.09z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Resize
