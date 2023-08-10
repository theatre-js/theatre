import type {NextApiRequest, NextApiResponse} from 'next'
import type {User} from '../../prisma/client-generated'
import prisma from '../prisma'
import {getSession} from '@auth0/nextjs-auth0'
import {v4} from 'uuid'
import * as jose from 'jose'
import type {$IntentionalAny} from 'src/types'
import {TRPCError} from '@trpc/server'
import {z} from 'zod'

/**
 * Since Auth0 users are not stored in our database, we need to create a user in our database
 * whenever we encounter a valid Auth0 session. If the user already exists, we return it.
 *
 * If the session is not valid, we throw an error.
 */
export async function ensureUserFromAuth0Session(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<User> {
  const session = await getSession(req, res)
  if (!session || !session.user) {
    throw new Error(`User is not authenticated`)
  }

  const user = await prisma.user.findUnique({
    where: {
      auth0Sid: session.user.sid,
    },
  })

  if (!user) {
    const userId = v4() + v4()
    const user = await prisma.user.create({
      data: {
        auth0Sid: session.user.sid,
        email: session.user.email,
        auth0Data: session.user,
        id: userId,
      },
    })
    return user
  }

  return user
}

export type AccessTokenPayload = {
  userId: string
  email: string
}

export namespace studioAuth {
  export const input = z.object({accessToken: z.string()})
  function generateRefreshToken() {
    return v4() + v4() + v4() + v4()
  }

  /**
   * Generates an access token for the given user.
   */
  async function generateAccessToken(user: User): Promise<string> {
    const privateKey = await privateKeyPromise
    const payload: AccessTokenPayload = {
      userId: user.id,
      email: user.email,
    }
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({alg: 'RS256'})
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey)

    return jwt
  }

  export async function createSession(
    user: User,
  ): Promise<{refreshToken: string; accessToken: string}> {
    const refreshToken = generateRefreshToken()

    const session = await prisma.libSession.create({
      data: {
        createdAt: new Date().toISOString(),
        refreshToken,
        validUntil:
          // now + 2 months
          new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 2).toISOString(),
        userId: user.id,
      },
    })

    const accessToken = await generateAccessToken(user)

    return {refreshToken, accessToken}
  }

  export async function destroySession(refreshToken: string) {
    await prisma.libSession.delete({
      where: {
        refreshToken,
      },
    })
  }

  /**
   * Returns a new accessToken, and a new refreshToken. The old refreshToken is invalidated.
   */
  export async function refreshSession(
    refreshToken: string,
  ): Promise<{refreshToken: string; accessToken: string}> {
    const session = await prisma.libSession.findUnique({
      where: {
        refreshToken,
      },
    })

    if (!session) {
      throw new Error(`Invalid refresh token`)
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    })

    if (!user) {
      throw new Error(`Invalid refresh token`)
    }

    await destroySession(refreshToken)
    const {refreshToken: newRefreshToken, accessToken} =
      await createSession(user)

    return {refreshToken: newRefreshToken, accessToken}
  }

  export async function verifyStudioAccessTokenOrThrow(opts: {
    input: {
      studioAuth: {accessToken: string}
    }
  }): Promise<AccessTokenPayload> {
    const publicKey = await publicKeyPromise
    try {
      const res = await jose.jwtVerify(
        opts.input.studioAuth.accessToken,
        publicKey,
        {
          maxTokenAge: '1h',
        },
      )

      const {payload} = res as $IntentionalAny

      return payload as AccessTokenPayload
    } catch (e) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        cause: 'InvalidSession',
        message: 'Access token could not be verified',
      })
    }
  }

  const privateKeyPromise = jose.importPKCS8(
    process.env.STUDIO_AUTH_JWT_PRIVATE_KEY!,
    'RS256',
  )

  const publicKeyPromise = jose.importSPKI(
    process.env.STUDIO_AUTH_JWT_PUBLIC_KEY!,
    'RS256',
  )
}
