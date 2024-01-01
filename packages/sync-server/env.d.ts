// Ideally we'd type process.env so that it matches our Env type in `src/envSchema.ts`, but since other packages in the monorepo
// do the same, TS acts flaky, which is likely becuase a bug in TS itself. Our workaround is to use `./src/env.ts` as a typed proxy
// to `process.env` and import that instead.

export {}
