import {getAppSession} from '~/utils/authUtils'
import Navigation from './_components/Navigation'
import SessionProvider from './_components/SessionProvider'
import {redirect} from 'next/navigation'
import {Suspense} from 'react'
import prisma from '~/prisma'
import {type Session} from 'next-auth'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAppSession()

  if (!session) {
    redirect('/api/auth/signin')
  }

  await ensureSetupComplete(session)

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen">
        <div className="max-w-xs border-r ">
          <Suspense>
            <Navigation />
          </Suspense>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </SessionProvider>
  )
}

async function ensureSetupComplete(session: Session) {
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      teams: true,
    },
  })

  // If no team, create one
  if (user!.teams.length === 0) {
    await prisma.team.create({
      data: {
        name: user?.name ? `${user?.name}'s Team` : 'My Team',
        members: {
          create: {
            userId: user!.id,
            userRole: 'OWNER',
            accepted: true,
          },
        },
      },
    })
  }

  const setupIncomplete = !user?.email || !user?.name

  if (setupIncomplete) {
    redirect('/account-setup')
  }
}
