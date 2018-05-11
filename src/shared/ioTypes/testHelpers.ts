import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import {PathReporter} from './PathReporter'

export function assertSuccess(validation: t.Validation): void {
  assert.ok(validation.isRight())
}

export function assertFailure(
  validation: t.Validation,
  descriptions: Array<string>,
): void {
  assert.ok(validation.isLeft())
  assert.deepEqual(PathReporter.report(validation), descriptions)
}

export const string2 = new t.Type<string>(
  'string2',
  (v): v is string => t.string.is(v) && v[1] === '-',
  (s, c) =>
    t.string._validateWithContext(s, c).chain(() => {
      if ((s as string).length === 2) {
        return t.success()
      } else {
        return t.failure(s, c)
      }
    }),
)
