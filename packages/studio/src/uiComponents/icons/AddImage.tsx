import * as React from 'react'

function AddImage(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3.335 13.998c-.367 0-.68-.13-.942-.391a1.285 1.285 0 01-.391-.942v-9.33c0-.367.13-.68.391-.942.261-.26.575-.391.942-.391h5.998v3.332h1.333v1.333h3.332v5.998c0 .367-.13.68-.391.942-.261.26-.575.391-.942.391h-9.33zM4 11.332H12L9.499 8 7.5 10.666l-1.5-2-1.999 2.666zm7.331-5.331V4.668H10V3.335h1.333V2.002h1.333v1.333h1.333v1.333h-1.333V6h-1.333z"
        fill="currentColor"
      />
    </svg>
  )
}

export default AddImage
