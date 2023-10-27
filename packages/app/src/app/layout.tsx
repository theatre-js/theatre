import {headers} from 'next/headers'
import {TRPCReactProvider} from '~/trpc/react'
import './global.css'
import {Toaster} from '~/ui/components/ui/toaster'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider headers={headers()}>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  )
}
