import {TheatreLoggerLevel} from './logger'
import {describeLogger} from './logger.test-helpers'

describeLogger('Theatre internal logger', (setup) => {
  describe('default logger', () => {
    test('it reports public messages', () => {
      const t = setup().t()

      t.expectIncluded('errorPublic', 'error')
      t.expectIncluded('warnPublic', 'warn')
    })

    test('it does not report dev messages', () => {
      const t = setup().t()

      t.expectExcluded('errorDev')
      t.expectExcluded('warnDev')
      t.expectExcluded('debugDev')
      t.expectExcluded('traceDev')
    })

    test('it does not report internal messages', () => {
      const t = setup().t()

      t.expectExcluded('_hmm')
      t.expectExcluded('_kapow')
      t.expectExcluded('_debug')
      t.expectExcluded('_trace')
    })
  })

  describe('custom logging', () => {
    test('it can include all dev and internal logs', () => {
      const h = setup()

      const initial = h.t()

      h.internal.configureLogging({
        dev: true,
        internal: true,
        min: TheatreLoggerLevel.TRACE,
      })

      const t = h.t()

      // initial logger will not have been able to acknowledge
      // the logging config update.
      initial.expectExcluded('_hmm')
      initial.expectExcluded('errorDev')

      t.expectIncluded('_hmm', 'error')
      t.expectIncluded('_kapow', 'warn')
      t.expectIncluded('_debug', 'info')
      t.expectIncluded('_trace', 'debug')

      t.expectIncluded('errorDev', 'error')
      t.expectIncluded('warnDev', 'warn')
      t.expectIncluded('debugDev', 'info')
      t.expectIncluded('traceDev', 'debug')
    })

    test('it can include WARN level dev and internal logs', () => {
      const h = setup()

      h.internal.configureLogging({
        dev: true,
        internal: true,
        min: TheatreLoggerLevel.WARN,
      })

      const t = h.t()

      t.expectIncluded('_hmm', 'error')
      t.expectIncluded('_kapow', 'warn')
      t.expectIncluded('errorDev', 'error')
      t.expectIncluded('warnDev', 'warn')

      t.expectExcluded('_debug')
      t.expectExcluded('_trace')
      t.expectExcluded('debugDev')
      t.expectExcluded('traceDev')
    })

    test('it can include WARN level dev logs', () => {
      const h = setup()

      h.internal.configureLogging({
        dev: true,
        min: TheatreLoggerLevel.WARN,
      })

      const t = h.t()

      t.expectIncluded('errorDev', 'error')
      t.expectIncluded('warnDev', 'warn')

      t.expectExcluded('_hmm')
      t.expectExcluded('_kapow')
      t.expectExcluded('_debug')
      t.expectExcluded('_trace')
      t.expectExcluded('debugDev')
      t.expectExcluded('traceDev')
    })
  })

  describe('named and keys', () => {
    test('default with no name has no colors', () => {
      const h = setup()
      const app = h.t().named('App')
      const appK2 = app.named('K', 1)

      app.expectIncluded('errorPublic', 'error', ['App', {not: /K.*#1/}])
      app.expectIncluded('warnPublic', 'warn', ['App', {not: /K.*#1/}])
      appK2.expectIncluded('errorPublic', 'error', ['App', /App.*K.*#1/])
      appK2.expectIncluded('warnPublic', 'warn', ['App', /App.*K.*#1/])
    })
  })

  describe('named gets colors', () => {
    test('default with no name has no colors', () => {
      const h = setup()
      const t = h.t()

      t.expectIncluded('errorPublic', 'error', [{not: 'color:'}])
      t.expectIncluded('warnPublic', 'warn', [{not: 'color:'}])
    })

    test('default with name has color', () => {
      const h = setup()
      const t = h.t().named('Test1')

      t.expectIncluded('errorPublic', 'error', ['color:', 'Test1'])
      t.expectIncluded('warnPublic', 'warn', ['color:', 'Test1'])
    })

    test('consoleStyle: false with name does not have color', () => {
      const h = setup()
      h.internal.configureLogging({
        consoleStyle: false,
      })

      const t = h.t().named('Test1')

      t.expectIncluded('errorPublic', 'error', [{not: 'color:'}, 'Test1'])
      t.expectIncluded('warnPublic', 'warn', [{not: 'color:'}, 'Test1'])
    })

    test('console style: false with name does not have color', () => {
      const h = setup()
      h.internal.configureLogger({
        type: 'console',
        console: h.con,
        style: false,
      })

      const t = h.t().named('Test1')

      t.expectIncluded('errorPublic', 'error', [{not: 'color:'}, 'Test1'])
      t.expectIncluded('warnPublic', 'warn', [{not: 'color:'}, 'Test1'])
    })
  })
  describe('utilFor', () => {
    test('.utilFor.public() with defaults', () => {
      const h = setup()

      const publ = h.t().utilFor.public()

      publ.expectIncluded('error', 'error')
      publ.expectIncluded('warn', 'warn')
      publ.expectExcluded('debug')
      publ.expectExcluded('trace')
    })

    test('.utilFor.dev() with defaults', () => {
      const h = setup()

      const dev = h.t().utilFor.dev()

      dev.expectExcluded('error')
      dev.expectExcluded('warn')
      dev.expectExcluded('debug')
      dev.expectExcluded('trace')
    })

    test('.utilFor.internal() with defaults', () => {
      const h = setup()

      const internal = h.t().utilFor.internal()

      internal.expectExcluded('error')
      internal.expectExcluded('warn')
      internal.expectExcluded('debug')
      internal.expectExcluded('trace')
    })

    test('.utilFor.internal() can be named', () => {
      const h = setup()

      h.internal.configureLogging({
        internal: true,
        min: TheatreLoggerLevel.TRACE,
      })

      const internal = h.t().utilFor.internal()
      const appleInternal = internal.named('Apple')

      internal.expectIncluded('error', 'error', [{not: 'Apple'}])
      internal.expectIncluded('warn', 'warn', [{not: 'Apple'}])
      internal.expectIncluded('debug', 'info', [{not: 'Apple'}])
      internal.expectIncluded('trace', 'debug', [{not: 'Apple'}])

      appleInternal.expectIncluded('error', 'error', ['Apple'])
      appleInternal.expectIncluded('warn', 'warn', ['Apple'])
      appleInternal.expectIncluded('debug', 'info', ['Apple'])
      appleInternal.expectIncluded('trace', 'debug', ['Apple'])
    })

    test('.utilFor.public() debug/trace warns internal', () => {
      const h = setup()
      {
        h.internal.configureLogging({
          internal: true,
        })
        const publ = h.t().utilFor.public()

        publ.expectIncluded('error', 'error', [{not: 'filtered out'}])
        publ.expectIncluded('warn', 'warn', [{not: 'filtered out'}])

        // warnings go through internal loggers since public loggers do not have a trace or debug level
        publ.expectIncluded('debug', 'warn', ['filtered out'])
        publ.expectIncluded('trace', 'warn', ['filtered out'])
      }

      {
        h.internal.configureLogging({
          dev: true,
        })
        const publ = h.t().utilFor.public()

        publ.expectIncluded('error', 'error', [{not: /filtered out/}])
        publ.expectIncluded('warn', 'warn', [{not: /filtered out/}])

        // warnings only go through internal loggers
        publ.expectExcluded('debug')
        publ.expectExcluded('trace')
      }
    })
  })
})
