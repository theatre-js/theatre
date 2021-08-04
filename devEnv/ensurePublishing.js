if (process.env.THEATRE_IS_PUBLISHING !== 'true') {
  throw Error(
    `This script may run only when the "deploy" command in monorepo's root is running.`,
  )
}
