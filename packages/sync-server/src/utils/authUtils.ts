import * as jose from 'jose'
import {TRPCError} from '@trpc/server'
import type {AccessTokenPayload} from '@theatre/app/src/utils/authUtils'
import type {$IntentionalAny} from 'src/types'
import {appHost} from 'src/appClient'

const jwtPublicKey = fetch(appHost + `/api/jwt-public-key`)
  .then((response) => response.json())
  .then((json) => json.publicKey)
  .then((publicKeyString) => jose.importSPKI(publicKeyString, 'RS256'))

export type Session = {
  _accessToken: string
} & AccessTokenPayload

export async function verifyAccessTokenOrThrow(opts: {
  input: {studioAuth: {accessToken: string}}
}): Promise<Session> {
  const {accessToken} = opts.input.studioAuth

  const publicKey = await jwtPublicKey
  try {
    const res = await jose.jwtVerify(accessToken, publicKey, {
      maxTokenAge: '1h',
    })

    const {payload}: {payload: AccessTokenPayload} = res as $IntentionalAny

    return {_accessToken: accessToken, ...payload}
  } catch (e) {
    console.log(`e`, e)
    console.log('jwt invalid')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      cause: 'InvalidSession',
      message: 'Access token could not be verified',
    })
  }
}
