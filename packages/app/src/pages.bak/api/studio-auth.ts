import type {NextApiRequest, NextApiResponse} from 'next'
import prisma from 'src/prisma'

import {getAppSession, studioAuth} from 'src/utils/authUtils'
import {userCodeLength} from '~/server/api/routes/studioAuthRouter'

export default async function libAuth(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({error: 'Method not allowed'})
    return
  }
  const query = req.query as Record<string, string>
  const {userCode} = query
  if (typeof userCode !== 'string' || userCode.length !== userCodeLength) {
    res.status(400).json({
      error: `userCode must be a string of length ${userCodeLength}`,
    })
    return
  }

  const row = await prisma.libAuthenticationFlow.findFirst({
    where: {
      userCode,
    },
  })
  if (row === null) {
    res.status(404).json({
      error:
        'This authentication flow either does not exist, or has already been used. Try again from the studio.',
    })
    return
  }

  const session = await getAppSession(req, res)

  // if no session, redirect to login
  if (!session || !session.user) {
    res.redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(req.url!)}`)
    return
  }

  if (row.state === 'tokenAlreadyUsed') {
    res.status(400).json({
      error:
        'This authentication flow has already been used. Try again from the studio.',
    })
    return
  }

  if (row.state === 'userDeniedAuth') {
    res.status(400).json({
      error:
        'This authentication flow has been denied by the user. Try again from the studio.',
    })
    return
  }

  if (row.state === 'userAllowedAuth') {
    res.status(400).json({
      error:
        'This authentication flow has already been used. Try again from the studio.',
    })
    return
  }

  if (row.state !== 'initialized') {
    res.status(500).json({
      error: `This authentication flow is in an invalid state. Try again from the studio.`,
    })
    return
  }

  const user = session.user

  const {refreshToken, accessToken} = await studioAuth.createSession(user)

  await prisma.libAuthenticationFlow.update({
    where: {
      preAuthenticationToken: row.preAuthenticationToken,
    },
    data: {
      state: 'userAllowedAuth',
      tokens: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    },
  })

  res.status(200).json('success')
}
