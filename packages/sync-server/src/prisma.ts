import {PrismaClient} from '../prisma/client-generated'
import {env} from './env'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
})

export default prisma
