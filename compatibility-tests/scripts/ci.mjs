import {installTests} from './scripts.mjs'
;(async function runCI() {
  await installTests()
  process.exit(0)
})()
