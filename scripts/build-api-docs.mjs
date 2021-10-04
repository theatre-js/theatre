import path from 'path'
import {readFileSync, writeFileSync} from 'fs'
import {keyBy} from 'lodash-es'
import {parse as parseJsonC} from 'jsonc-parser'
;(async function () {
  // better quote function from https://github.com/google/zx/pull/167
  $.quote = function quote(arg) {
    if (/^[a-z0-9/_.-]+$/i.test(arg)) {
      return arg
    }
    return (
      `$'` +
      arg
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\f/g, '\\f')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\v/g, '\\v')
        .replace(/\0/g, '\\0') +
      `'`
    )
  }

  const outputPathArg = argv._[argv._.length - 1]
  if (outputPathArg.trim().length === 0) {
    console.error(
      `You must provide a path to create the markdown files in. Eg. $ yarn build:api-docs /path/to/docs-site/docs/api`,
    )
    process.exit(1)
  }
  const outputPath = path.resolve(outputPathArg)

  const pathToApiJsonFiles = path.dirname(
    path.resolve(
      './devEnv',
      parseJsonC(
        fs.readFileSync('./devEnv/api-extractor-base.json', {
          encoding: 'utf-8',
        }),
      ).docModel.apiJsonFilePath,
    ),
  )

  await $`yarn build:ts`
  await Promise.all(
    ['@theatre/dataverse', '@theatre/react', 'theatre'].map(
      (pkg) => $`yarn workspace ${pkg} run build:api-json`,
    ),
  )
  await $`api-documenter markdown --input-folder ${pathToApiJsonFiles} --output-folder ${outputPath}`
})()
