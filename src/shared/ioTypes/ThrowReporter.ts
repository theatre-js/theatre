import {Reporter} from './Reporter'
import {PathReporter} from './PathReporter'

export const ThrowReporter: Reporter<void> = {
  report: validation => {
    if (validation.isLeft()) {
      throw PathReporter.report(validation).join('\n')
    }
  },
}
