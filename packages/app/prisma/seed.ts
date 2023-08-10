/**
 * Adds seed data to your db
 *
 * See https://www.prisma.io/docs/guides/database/seed-database
 */
import {PrismaClient} from './client-generated'

const prisma = new PrismaClient()

async function main() {
  // nothing to seed rn
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
