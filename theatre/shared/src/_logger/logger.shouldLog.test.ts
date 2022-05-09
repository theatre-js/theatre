import {TheatreLoggerLevel, _LoggerLevel} from './logger'
import {_loggerShouldLog} from './logger'

describe('Theatre internal logger: shouldLog', () => {
  testIncludes(
    'TRACE dev/internal',
    {
      dev: true,
      internal: true,
      min: TheatreLoggerLevel.TRACE,
    },
    {
      _ERROR: true,
      _HMM: true,
      _TODO: true,
      ERROR_DEV: true,
      ERROR_PUBLIC: true,
      _KAPOW: true,
      _WARN: true,
      WARN_DEV: true,
      WARN_PUBLIC: true,
      _DEBUG: true,
      DEBUG_DEV: true,
      _TRACE: true,
      TRACE_DEV: true,
    },
  )

  testIncludes(
    'DEBUG dev/internal',
    {
      dev: true,
      internal: true,
      min: TheatreLoggerLevel.DEBUG,
    },
    {
      _ERROR: true,
      _HMM: true,
      _TODO: true,
      ERROR_DEV: true,
      ERROR_PUBLIC: true,
      _WARN: true,
      _KAPOW: true,
      WARN_DEV: true,
      WARN_PUBLIC: true,
      _DEBUG: true,
      DEBUG_DEV: true,
      _TRACE: false,
      TRACE_DEV: false,
    },
  )

  testIncludes(
    'TRACE dev',
    {
      dev: true,
      internal: false,
      min: TheatreLoggerLevel.TRACE,
    },
    {
      _ERROR: false,
      _HMM: false,
      _KAPOW: false,
      _TODO: false,
      ERROR_DEV: true,
      ERROR_PUBLIC: true,
      _WARN: false,
      WARN_DEV: true,
      WARN_PUBLIC: true,
      _DEBUG: false,
      DEBUG_DEV: true,
      _TRACE: false,
      TRACE_DEV: true,
    },
  )

  testIncludes(
    'TRACE',
    {
      dev: false,
      internal: false,
      min: TheatreLoggerLevel.TRACE,
    },
    {
      _ERROR: false,
      _HMM: false,
      _KAPOW: false,
      _TODO: false,
      ERROR_DEV: false,
      ERROR_PUBLIC: true,
      _WARN: false,
      WARN_DEV: false,
      WARN_PUBLIC: true,
      _DEBUG: false,
      DEBUG_DEV: false,
      _TRACE: false,
      TRACE_DEV: false,
    },
  )

  testIncludes(
    'WARN dev',
    {
      dev: true,
      internal: false,
      min: TheatreLoggerLevel.WARN,
    },
    {
      _ERROR: false,
      _HMM: false,
      _KAPOW: false,
      _TODO: false,
      ERROR_DEV: true,
      ERROR_PUBLIC: true,
      _WARN: false,
      WARN_DEV: true,
      WARN_PUBLIC: true,
      _DEBUG: false,
      DEBUG_DEV: false,
      _TRACE: false,
      TRACE_DEV: false,
    },
  )

  testIncludes(
    'TRACE internal',
    {
      dev: false,
      internal: true,
      min: TheatreLoggerLevel.TRACE,
    },
    {
      _ERROR: true,
      _HMM: true,
      _TODO: true,
      ERROR_DEV: false,
      ERROR_PUBLIC: true,
      _KAPOW: true,
      _WARN: true,
      WARN_DEV: false,
      WARN_PUBLIC: true,
      _DEBUG: true,
      DEBUG_DEV: false,
      _TRACE: true,
      TRACE_DEV: false,
    },
  )
})

function testIncludes(
  name: string,
  config: {
    dev: boolean
    internal: boolean
    min: TheatreLoggerLevel
  },
  expectations: {[P in keyof typeof _LoggerLevel]: boolean},
) {
  test.each(Object.entries(expectations))(
    `${name} + %s = %s`,
    (level, expectIsIncluded) => {
      const actual = _loggerShouldLog(config, _LoggerLevel[level])
      if (actual !== expectIsIncluded) {
        const stackless = new Error(
          `Expected shouldLog({ dev: ${config.dev}, internal: ${
            config.internal
          }, max: ${TheatreLoggerLevel[config.min]} }, ${level}) = ${actual}`,
        )
        stackless.stack = undefined // stack is not useful in test
        throw stackless
      }
    },
  )
}
