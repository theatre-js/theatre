import React from 'react'
import {UserProvider} from '@auth0/nextjs-auth0/client'

export default function App({
  Component,
  pageProps,
}: {
  Component: React.ComponentType
  pageProps: any
}) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  )
}
