import z from 'zod'

// the env variables that are only required in development
const devOnly = z.object({
  NODE_ENV: z.literal('development'),
  DEV_DB_PORT: z.string(),
  DEV_DB_PASSWORD: z.string(),
})

// the env variables that both development and production require
const commonSchema = z.object({
  DATABASE_URL: z.string(),
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  STUDIO_AUTH_JWT_PRIVATE_KEY: z
    .string()
    .startsWith('-----BEGIN PRIVATE KEY-----')
    .endsWith('-----END PRIVATE KEY-----'),
  STUDIO_AUTH_JWT_PUBLIC_KEY: z
    .string()
    .startsWith('-----BEGIN PUBLIC KEY-----')
    .endsWith('-----END PUBLIC KEY-----'),
  PORT: z.string().regex(/^\d+$/),
  HOST: z.string(),
  NEXT_PUBLIC_WEBAPP_URL: z.string().url(),
})

// the env variables that are required in development (devOnly and commonSchema)
export const devSchema = commonSchema.merge(devOnly)

// the env variables that are only required in production
const productionOnly = z.object({
  NODE_ENV: z.literal('production'),
})
// the env variables that are required in production (productionOnly + commonSchema)
export const productionSchema = commonSchema.merge(productionOnly)

// the env variables that are required in both development and production
export const fullSchema = productionSchema.merge(devOnly)

export type Env = z.infer<typeof fullSchema>
