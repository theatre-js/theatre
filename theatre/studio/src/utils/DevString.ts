import {stringify} from './stringify'

export type DevString =
  | (string & {
      /** branded type for dev string */
      _dev: true
    })
  | undefined

/**
 * Replaceable during esbuild to create smaller packages since
 * it will always return or undefined.
 *
 * {@link DevString}
 */
export function dev(
  tmpl: TemplateStringsArray,
  ...substitutions: any[]
): DevString {
  return String.raw(
    tmpl,
    ...substitutions.map((s) => stringify(s)),
  ) as DevString
}
