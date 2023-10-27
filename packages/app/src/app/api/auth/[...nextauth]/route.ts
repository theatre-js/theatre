import NextAuth from 'next-auth'
import {nextAuthConfig} from 'src/utils/authUtils'

const handler = NextAuth(nextAuthConfig)
export {handler as GET, handler as POST}
