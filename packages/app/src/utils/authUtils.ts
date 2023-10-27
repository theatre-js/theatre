import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type {User} from '../../prisma/client-generated'
import prisma from '../prisma'
import {v4} from 'uuid'
import * as jose from 'jose'
import type {$IntentionalAny} from 'src/types'
import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import type {AuthOptions} from 'next-auth'
import {getServerSession} from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import {PrismaAdapter} from '@auth/prisma-adapter'
import type {Adapter} from 'next-auth/adapters'

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
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
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
      email: user.email ?? '',
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
