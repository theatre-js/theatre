import {tightJsonStringify} from './tightJsonStringify'

export function stringify(input: any, indentJSON: boolean = true): string {
  try {
    return typeof input === 'string'
      ? input
      : typeof input === 'function'
      ? input.toString()
      : indentJSON
      ? tightJsonStringify(input)
      : JSON.stringify(input)
  } catch (err) {
    return input?.name || String(input)
  }
}

export function stringifyError(err: any) {
  return err instanceof Error
    ? err.toString()
    : err == null
    ? undefined
    : stringify(err)
}
