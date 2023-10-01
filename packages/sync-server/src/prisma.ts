import {PrismaClient} from '../prisma/client-generated'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

export default prisma
