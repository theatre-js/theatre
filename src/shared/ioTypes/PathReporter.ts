import {Reporter} from './Reporter'
import {Context, getFunctionName, ValidationError} from '$shared/ioTypes'

function stringify(v: any): string {
  return typeof v === 'function' ? getFunctionName(v) : JSON.stringify(v)
}

function getContextPath(context: Context): string {
  return context.map(({key, type}) => `${key}: ${type.name}`).join('/')
}

function getMessage(v: any, context: Context): string {
  return `Invalid value ${stringify(v)} supplied to ${getContextPath(context)}`
}

export function failure(es: Array<ValidationError>): Array<string> {
  return es.map(e => getMessage(e.value, e.context))
}

export function success(): Array<string> {
  return ['No errors!']
}

export const PathReporter: Reporter<Array<string>> = {
  report: validation => validation.fold(failure, success),
}
