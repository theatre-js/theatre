'use client'

import {type Session} from 'next-auth'
import {SessionProvider as NextAuthSessionProvider} from 'next-auth/react'

export default async function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
