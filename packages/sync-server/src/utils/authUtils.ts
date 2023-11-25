import * as jose from 'jose'
import {TRPCError} from '@trpc/server'
import {appHost} from 'src/appClient'
import type {studioAuthTokens} from '@theatre/app/types'
import type {$IntentionalAny} from '@theatre/utils/types'

const jwtPublicKey = fetch(appHost + `/api/jwt-public-key`)
  .then((response) => response.json())
  .then((json) => json.publicKey)
  .then((publicKeyString) => jose.importSPKI(publicKeyString, 'RS256'))

export type Session = {
  _accessToken: string
} & studioAuthTokens.AccessTokenPayload

export async function verifyAccessTokenOrThrow(opts: {
  input: {studioAuth: {accessToken: string}}
}): Promise<Session> {
  const {accessToken} = opts.input.studioAuth
  console.log('verifying ', accessToken)

  const publicKey = await jwtPublicKey
  try {
    const res = await jose.jwtVerify(accessToken, publicKey, {
      maxTokenAge: '1h',
    })

    const {payload}: {payload: studioAuthTokens.AccessTokenPayload} =
      res as $IntentionalAny

    console.log('authorized')
    return {_accessToken: accessToken, ...payload}
  } catch (e) {
    console.log('unauthorized')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      cause: 'InvalidSession',
      message: 'Access token could not be verified',
    })
  }
}
