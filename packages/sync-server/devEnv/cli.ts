import sade from 'sade'
import {$, fs, path} from '@cspotcode/zx'
import {config} from 'dotenv'
import {fromZodError} from 'zod-validation-error'
import * as envSchema from 'src/envSchema'
import type {Env} from 'src/envSchema'

const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) {
  config({path: '.env'})
}

const usedSchema = isProduction
  ? envSchema.productionSchema
  : envSchema.devSchema

function validateEnv() {
  try {
    usedSchema.parse(process.env)
  } catch (error) {
    console.error("Environment variables aren't valid.")
    console.error(fromZodError(error as any))
    throw error
  }

  const env: Env = process.env as any
  const url = new URL(env.DATABASE_URL)
  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new Error(`DATABASE_URL protocol must be postgresql: Given: ${url}`)
  }

  if (!isProduction) {
    if (
      env.DATABASE_URL !==
      `postgresql://postgres:${env.DEV_DB_PASSWORD}@localhost:${env.DEV_DB_PORT}/postgres`
    ) {
      throw new Error(
        `We're in dev mode, so DATABASE_URL must match the other DB variables set in .env. DATABASE_URL should be: postgresql://postgres:${env.DEV_DB_PASSWORD}@localhost:${env.DEV_DB_PORT}/postgres`,
      )
    }
  }
}

const packageRoot = path.join(__dirname, '..')

const prog = sade('cli')

prog
  .command('dev all', 'Start all the development services, including next.js')
  .action(async () => {
    validateEnv()
    await devDb()
    await devServer()
  })

async function devServer() {
  validateEnv()
  await $`tsx watch src/index.ts --tsconfig tsconfig.json`
}
prog.command('dev start', 'Start dev server').action(devServer)

async function devDb() {
  validateEnv()
  await devDbDocker()

  await $`prisma generate`
  await $`prisma migrate dev`
  await $`prisma db seed`
}

prog.command('dev db', 'Start the database service').action(devDb)

async function devDbDocker() {
  validateEnv()
  await $`docker-compose up -d`
  // wait for the database to be ready
  await $`while ! (docker-compose ps postgres | grep -q "Up"); do sleep 2; done`
}
prog
  .command(
    'dev db docker',
    `Start the database service. Don't generate bindings`,
  )
  .action(devDbDocker)

prog.command('dev db nuke', 'Nuke the database').action(async () => {
  validateEnv()
  await $`docker-compose down --volumes --remove-orphans`
  await $`rm -rf prisma/*.db**`
})

prog
  .command('dev setup', 'Setup the development environment')
  .action(async () => {
    if (!fs.existsSync(path.join(packageRoot, '.env'))) {
      console.log(`Creating .env file`)
      fs.copyFileSync(
        path.join(packageRoot, '.env.example'),
        path.join(packageRoot, '.env'),
      )
    }
  })

prog.command('prod build', 'Build for production').action(async () => {
  validateEnv()
  await $`prisma migrate deploy`
})

prog.command('prod start', 'Start in production mode').action(async () => {
  validateEnv()
  await $`tsx src/index.ts --tsconfig tsconfig.json`
})

prog.command('prebuild', 'Prebuild pages').action(async () => {
  validateEnv()
  await $`prisma generate`
  await $`prisma migrate deploy`
})

prog.parse(process.argv)
