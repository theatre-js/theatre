import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type {LibSession, User} from '../../prisma/client-generated'
import prisma from '../prisma'
import * as jose from 'jose'
import type {studioAccessScopes} from 'src/types'
import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import type {AuthOptions} from 'next-auth'
import {getServerSession} from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import {PrismaAdapter} from '@auth/prisma-adapter'
import type {Adapter} from 'next-auth/adapters'
import type {studioAuthTokens} from 'src/types'
import type {$FixMe, $IntentionalAny} from '@theatre/utils/types'

// Extend NextAuth Session type to include all fields from the User model
declare module 'next-auth' {
  interface Session {
    user: User
  }
}

export const nextAuthConfig = {
  // Why type assertion: https://github.com/nextauthjs/next-auth/issues/6106#issuecomment-1582582312
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    session({session, token, user}) {
      session.user = {...session.user, ...user}
      return session
    },
    // redirect({url, baseUrl}) {
    //   if (url === '/api/auth/signin') return baseUrl
    //   // Allows relative callback URLs
    //   if (url.startsWith('/')) return `${baseUrl}${url}`
    //   // Allows callback URLs on the same origin
    //   else if (new URL(url).origin === baseUrl) return url
    //   return baseUrl
    // },
  },
} satisfies AuthOptions

// Use it in server contexts
export function getAppSession(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, nextAuthConfig)
}

export namespace studioAuth {
  export const jwtAlg = 'RS256'
  export const input = z.object({accessToken: z.string()})
  async function generateIdToken(
    nounce: string,
    user: User,
    scopes: studioAccessScopes.Scopes,
    expirationTime: Date,
  ): Promise<string> {
    const privateKey = await privateKeyPromise
    const payload: studioAuthTokens.IdTokenPayload = {
      userId: user.id,
      email: user.email ?? '',
      nounce,
      scopes,
    }
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({alg: jwtAlg})
      .setIssuedAt()
      .setExpirationTime(expirationTime.getTime())
      .sign(privateKey)

    return jwt
  }

  export async function parseAndVerifyIdToken(
    idToken: string,
  ): Promise<undefined | studioAuthTokens.IdTokenPayload> {
    const privateKey = await privateKeyPromise

    try {
      const s = await jose.jwtVerify(idToken, privateKey, {
        algorithms: [jwtAlg],
      })
      return s.payload as $FixMe
    } catch (err) {
      console.log(`parseAndVerifyIdToken failed:`, err)
      return undefined
    }
  }

  export function getIdTokenClaimsWithoutVerifying(
    idToken: string,
  ): undefined | studioAuthTokens.IdTokenPayload {
    try {
      const s = jose.decodeJwt(idToken)
      return s as $FixMe
    } catch (err) {
      console.log(`getIdTokenClaimsWithoutVerifying failed:`, err)
      return undefined
    }
  }

  /**
   * Generates an access token for the given user.
   */
  async function generateAccessToken(
    user: User,
    scopes: studioAccessScopes.Scopes,
  ): Promise<string> {
    const privateKey = await privateKeyPromise
    const payload: studioAuthTokens.AccessTokenPayload = {
      userId: user.id,
      email: user.email ?? '',
      scopes,
    }
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({alg: 'RS256'})
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey)

    return jwt
  }

  export async function createSession(
    nounce: string,
    user: User,
    scopes: studioAccessScopes.Scopes,
  ): Promise<{refreshToken: string; accessToken: string}> {
    // now + 2 months
    const validUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 2)

    const idToken = await generateIdToken(nounce, user, scopes, validUntil)

    const session = await prisma.libSession.create({
      data: {
        createdAt: new Date().toISOString(),
        refreshToken: idToken,
        validUntil: validUntil.toISOString(),
        userId: user.id,
      },
    })

    const accessToken = await generateAccessToken(user, scopes)

    return {refreshToken: idToken, accessToken}
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
    originalIdToken: string,
  ): Promise<{refreshToken: string; accessToken: string}> {
    const session = await prisma.libSession.findUnique({
      where: {
        refreshToken: originalIdToken,
      },
    })

    if (!session) {
      throw new Error(`Invalid refresh token`)
    }

    let originalSuccessorSession: null | LibSession = null

    // client has already tried to get a new refresh token using this refresh token.
    if (session.succeededByRefreshToken) {
      // there is a grace period in which the old refresh token is still valid (in case the new one didn't reach the client due to a network error or a race condition)
      if (session.successorLinkExpresAt! < new Date()) {
        // the grace period is over, the old refresh token is now invalid. let's delete it.
        await destroySession(session.refreshToken)
        throw new Error(`Invalid refresh token`)
      } else {
        // the grace period is still active, so a new id token has been issued. We should now find and remove that token before we issue another one
        originalSuccessorSession = await prisma.libSession.findUnique({
          where: {
            refreshToken: session.succeededByRefreshToken,
          },
        })

        // well, the new refresh token been removed for some reason. at this point, the client has to re-authenticate.
        if (!originalSuccessorSession) {
          // let's GC the old token while we're at it
          await destroySession(session.refreshToken)
          throw new Error(`Invalid refresh token`)
        }
      }
    }

    // the refresh token is expired
    if (session.validUntil < new Date()) {
      await destroySession(session.refreshToken)
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

    const {nounce, scopes} = getIdTokenClaimsWithoutVerifying(originalIdToken)!

    const {refreshToken: newRefreshToken, accessToken} = await createSession(
      nounce,
      user,
      scopes,
    )

    await prisma.libSession.update({
      where: {refreshToken: originalIdToken},
      data: {
        succeededByRefreshToken: newRefreshToken,
        successorLinkExpresAt: new Date(Date.now() + 60).toISOString(),
      },
    })

    if (originalSuccessorSession) {
      await destroySession(originalSuccessorSession.refreshToken)
    }

    return {refreshToken: newRefreshToken, accessToken}
  }

  export async function verifyStudioAccessTokenOrThrow(opts: {
    input: {
      studioAuth: {accessToken: string}
    }
  }): Promise<studioAuthTokens.AccessTokenPayload> {
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

      return payload as studioAuthTokens.AccessTokenPayload
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
