import {startRegistry} from './utils.mjs'
;(async function runCI() {
  await startRegistry()
  process.exit(0)
})()
