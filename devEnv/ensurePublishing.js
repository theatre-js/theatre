if (
  process.env.THEATRE_IS_PUBLISHING !== 'true' &&
  process.env.USING_YALC !== 'true'
) {
  throw Error(
    `This script may run only when the "release" command in monorepo's root is running.`,
  )
}
