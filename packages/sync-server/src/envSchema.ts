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
  PORT: z.string().regex(/^\d+$/),
  HOST: z.string(),
  APP_URL: z
    .string()
    .url()
    .describe(
      `the url to the app, like 'http://localhost:3000'. If the protocol is omitted,` +
        ` then https is assumed. If the port is omitted, then 80 is assumed.`,
    ),
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
