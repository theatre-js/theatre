import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import prisma from 'src/prisma'

import {getAppSession, studioAuth} from 'src/utils/authUtils'
import {userCodeLength} from '~/server/studio-api/routes/studioAuthRouter'
import {studioAccessScopes} from '~/types'
import {type $IntentionalAny} from '@theatre/utils/types'

export const dynamic = 'force-dynamic'

async function libAuth(req: NextRequest) {
  const userCode = req.nextUrl.searchParams.get('userCode')

  if (typeof userCode !== 'string' || userCode.length !== userCodeLength) {
    return NextResponse.json(
      {
        error: `userCode must be a string of length ${userCodeLength}`,
      },
      {status: 400},
    )
  }

  const row = await prisma.deviceAuthorizationFlow.findFirst({
    where: {
      userCode,
    },
  })
  if (row === null) {
    return NextResponse.json(
      {
        error:
          'This authentication flow either does not exist, or has already been used. Try again from the studio.',
      },
      {status: 404},
    )
  }

  const session = await getAppSession()

  // if no session, redirect to login
  if (!session || !session.user) {
    console.log('s', req.nextUrl.host, req.nextUrl.hostname, req.nextUrl.origin)
    const redirectUrl = new URL(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(
        req.nextUrl.toString(),
      )}`,
      req.nextUrl.origin,
    )
    return NextResponse.redirect(redirectUrl)
  }

  if (row.state === 'tokenAlreadyUsed') {
    return NextResponse.json(
      {
        error:
          'This authentication flow has already been used. Try again from the studio.',
      },
      {status: 400},
    )
  }

  if (row.state === 'userDeniedAuth') {
    return NextResponse.json(
      {
        error:
          'This authentication flow has been denied by the user. Try again from the studio.',
      },
      {status: 400},
    )
  }

  if (row.state === 'userAllowedAuth') {
    return NextResponse.json(
      {
        error:
          'This authentication flow has already been used. Try again from the studio.',
      },
      {status: 400},
    )
  }

  if (row.state !== 'initialized') {
    return NextResponse.json(
      {
        error: `This authentication flow is in an invalid state. Try again from the studio.`,
      },
      {status: 500},
    )
  }

  const user = session.user
  const nounce = row.nounce
  const scopes = row.scopes

  if (!studioAccessScopes.scopes.parse(scopes)) {
    console.error(`bad scopes`, scopes)
    await prisma.deviceAuthorizationFlow.delete({
      where: {deviceCode: row.deviceCode},
    })
    return NextResponse.json(
      {
        error: `This authentication flow is in an invalid state. Try again from the studio.`,
      },
      {status: 500},
    )
  }

  const {refreshToken, accessToken} = await studioAuth.createSession(
    nounce,
    user,
    scopes as $IntentionalAny,
  )

  await prisma.deviceAuthorizationFlow.update({
    where: {
      deviceCode: row.deviceCode,
    },
    data: {
      state: 'userAllowedAuth',
      tokens: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    },
  })

  return NextResponse.json('success', {status: 200})
}

export {libAuth as GET}
