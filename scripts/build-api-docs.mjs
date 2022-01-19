/**
 * This script generates API documentation files in the target folder.
 * Usage: `$ yarn build:api-docs <path>` creates the .md files in <path>.
 * Example: `$ yarn build:api-docs path/to/theatre-docs/docs/api/`
 *
 * Usually <path> is https://github.com/AriaMinaei/theatre-docs/tree/main/docs/api
 */
import path from 'path'
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

  /*
   We replace the Pointer name with a similar-looking one so that that shitty
   api-documenter generates two different pages for Pointer and pointer, instead
   of overwriting one with the other.

   Apparently any non-english character, including this one will break links,
   probably due to some overzealous regex. Didn't find any replacement that doesn't
   change the look of the name AND doesn't break links, however the below code does
   replace links too, in case we find something in the future. For now, we shouldn't
   @link to the Pointer type in TSDoc comments.
   */
  const replacement = 'Pointer\u200E'

  fs.writeFileSync('./.temp/api/dataverse.api.json', fs.readFileSync('./.temp/api/dataverse.api.json', {
    encoding: 'utf-8',
  }).replaceAll('"name": "Pointer"', `"name": "${replacement}"`).replaceAll('{@link Pointer}', `{@link ${replacement}}`))

  await $`api-documenter markdown --input-folder ${pathToApiJsonFiles} --output-folder ${outputPath}`
})()
