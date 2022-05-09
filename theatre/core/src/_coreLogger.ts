import type {
  ITheatreLoggerConfig,
  ITheatreLoggingConfig,
} from '@theatre/shared/logger'
import {TheatreLoggerLevel} from '@theatre/shared/logger'
import {createTheatreInternalLogger} from '@theatre/shared/logger'

export type CoreLoggingConfig = Partial<{
  logger: ITheatreLoggerConfig
  logging: ITheatreLoggingConfig
}>

function noop() {}

export function _coreLogger(config?: CoreLoggingConfig) {
  const internalMin = config?.logging?.internal
    ? config.logging.min ?? TheatreLoggerLevel.WARN
    : Infinity // if not internal, then don't show any logs
  const shouldDebugLogger = internalMin <= TheatreLoggerLevel.DEBUG
  const shouldShowLoggerErrors = internalMin <= TheatreLoggerLevel.ERROR
  const internal = createTheatreInternalLogger(undefined, {
    _debug: shouldDebugLogger
      ? console.debug.bind(console, '_coreLogger(TheatreInternalLogger) debug')
      : noop,
    _error: shouldShowLoggerErrors
      ? console.error.bind(console, '_coreLogger(TheatreInternalLogger) error')
      : noop,
  })

  if (config) {
    const {logger, logging} = config
    if (logger) internal.configureLogger(logger)
    if (logging) internal.configureLogging(logging)
    else {
      // default to showing Theatre.js dev logs in non-production environments
      internal.configureLogging({
        dev: process.env.NODE_ENV !== 'production',
      })
    }
  }

  return internal.getLogger().named('Theatre')
}
