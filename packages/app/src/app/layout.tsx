import {headers} from 'next/headers'
import {TRPCReactProvider} from '~/trpc/react'
import './global.css'
import {Toaster} from '~/ui/components/ui/toaster'
import Prompts from './_components/Prompts'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider headers={headers()}>
          <Toaster />
          <Prompts />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  )
}
