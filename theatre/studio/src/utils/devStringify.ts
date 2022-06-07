import {tightJsonStringify} from './tightJsonStringify'

export function devStringify(input: any, indentJSON: boolean = true): string {
  try {
    return typeof input === 'string'
      ? input
      : typeof input === 'function' || input instanceof Error
      ? input.toString()
      : indentJSON
      ? tightJsonStringify(input)
      : JSON.stringify(input)
  } catch (err) {
    return input?.name || String(input)
  }
}
