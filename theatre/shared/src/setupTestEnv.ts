// @ts-expect-error ignore
global.$env = {disableStatePersistence: true, ...process.env, isCore: false}
