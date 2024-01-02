import z from 'zod'

// the env variables that both development and production require
const commonSchema = z.object({
  BUILT_FOR_PLAYGROUND: z
    .enum(['true', 'false'])
    .describe(
      `Whether the app is built for packages/playground. If true, some behavior is different, e.g. the update checker is disabled.`,
    ),
  THEATRE_VERSION: z
    .string()
    .describe(`The version of the package, as defined in package.json`),
  BACKEND_URL: z.optional(
    z
      .string()
      .url()
      .describe(
        `the url to the app, like 'http://localhost:3000'. If the protocol is omitted,` +
          ` then https is assumed. If the port is omitted, then 80 is assumed.`,
      ),
  ),
})

// the env variables that are required in development (devOnly and commonSchema)
export const devSchema = commonSchema.extend({
  // NODE_ENV: z.literal('development'),
})

// the env variables that are only required in production
export const productionSchema = commonSchema.extend({
  // NODE_ENV: z.literal('production'),
})

// the env variables that are required in both development and production
export const fullSchema = z.union([productionSchema, devSchema])

export type Env = z.infer<typeof fullSchema>
