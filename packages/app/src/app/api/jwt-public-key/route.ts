import {NextResponse} from 'next/server'
import {allowCors} from '~/utils'

async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    const res = new Response(null, {status: 204})
    allowCors(res)

    return res
  }

  const res = NextResponse.json({
    publicKey: process.env.STUDIO_AUTH_JWT_PUBLIC_KEY,
  })

  allowCors(res)

  return res
}

export {handler as GET, handler as OPTIONS}
