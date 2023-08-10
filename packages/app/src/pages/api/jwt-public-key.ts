import type {NextApiRequest, NextApiResponse} from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Request-Method', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({error: 'Method not allowed'})
    return
  }
  res.status(200).json({publicKey: process.env.STUDIO_AUTH_JWT_PUBLIC_KEY})
}
