import React from 'react'
import {SessionProvider} from 'next-auth/react'
import {trpcClient} from 'src/trpc/trpcClient'
import type {AppProps} from 'next/app'

function App({Component, pageProps: {session, ...pageProps}}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default trpcClient.withTRPC(App)
