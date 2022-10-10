import type {
  ITheatreConsoleLogger,
  _LogFns,
  ITheatreInternalLoggerOptions,
  IUtilLogger,
  ILogger,
} from './logger'
import {createTheatreInternalLogger} from './logger'

const DEBUG_LOGGER = false

function noop() {}

export function describeLogger(
  name: string,
  body: (setup: () => ReturnType<typeof setupFn>) => void,
) {
  describe(name, () => {
    body(
      setupFn.bind(null, {
        _debug: DEBUG_LOGGER ? console.log.bind(console, name) : noop,
        _error: console.error.bind(console, name),
      }),
    )
  })
}

function setupFn(options: ITheatreInternalLoggerOptions) {
  const con = spyConsole()
  const internal = createTheatreInternalLogger(con, options)
  function t(logger = internal.getLogger()) {
    return {
      expectExcluded(kind: keyof _LogFns) {
        try {
          const message = `${kind} message`
          logger[kind](message)
          expect(con.debug).not.toBeCalled()
          expect(con.info).not.toBeCalled()
          expect(con.warn).not.toBeCalled()
          expect(con.error).not.toBeCalled()
        } catch (err) {
          throw new LoggerTestError(
            `Expected logger.${kind}(...) excluded from logging\n${(
              err as Error
            ).toString()}`,
          )
        }
      },
      expectIncluded(
        kind: keyof _LogFns,
        expectOutputted: keyof ITheatreConsoleLogger,
        includes: TestLoggerIncludes = [],
      ) {
        try {
          const message = `${kind} message`
          logger[kind](message)
          if (expectOutputted !== 'debug') {
            expect(con.debug).not.toBeCalled()
          }
          if (expectOutputted !== 'info') {
            expect(con.info).not.toBeCalled()
          }
          if (expectOutputted !== 'warn') {
            expect(con.warn).not.toBeCalled()
          }
          if (expectOutputted !== 'error') {
            expect(con.error).not.toBeCalled()
          }
          expectLastCalledWith(con[expectOutputted], includes)
        } catch (err) {
          throw new LoggerTestError(
            `Expected logger.${kind}(...) included and outputted via console.${expectOutputted}(...)\n${(
              err as Error
            ).toString()}`,
          )
        }
        con[expectOutputted].mockReset()
      },
      named(name: string, key?: string | number) {
        return t(logger.named(name, key))
      },
      utilFor: objMap(
        logger.utilFor,
        ([audience, downgradeFn]) =>
          () =>
            setupUtilLogger(downgradeFn(), audience, con),
      ),
    }
  }
  return {
    internal,
    con,
    t,
  }
}

function expectLastCalledWith(
  fn: jest.MockInstance<any, any[]>,
  includes: TestLoggerIncludes,
) {
  expect(fn).toBeCalled()
  if (includes.length > 0) {
    const [lastCall] = fn.mock.calls
    const concat = lastCall.filter(Boolean).map(String).join(', ')
    const errors = includes.flatMap((includeTest) => {
      if (typeof includeTest === 'string') {
        return concat.includes(includeTest)
          ? []
          : [`didn't include ${JSON.stringify(includeTest)}`]
      } else if ('test' in includeTest) {
        return includeTest.test(concat)
          ? []
          : [`didn't match ${String(includeTest)}`]
      } else if (typeof includeTest.not === 'string') {
        return concat.includes(includeTest.not)
          ? [`wasn't supposed to include ${JSON.stringify(includeTest.not)}`]
          : []
      } else if ('test' in includeTest.not) {
        return includeTest.not.test(concat)
          ? [`wasn't supposed to match ${String(includeTest.not)}`]
          : []
      }
    })
    if (errors.length > 0) {
      throw new LoggerTestError(
        `Last called with ${JSON.stringify(concat)}, but ${errors.join(', ')}`,
      )
    }
  }
}

function objMap<T, U>(
  template: T,
  eachEntry: <P extends keyof T>(entry: [name: P, value: T[P]]) => U,
): {[P in keyof T]: U} {
  // @ts-ignore
  return Object.fromEntries(
    Object.entries(template).map((entry) => {
      // @ts-ignore
      return [entry[0], eachEntry(entry)]
    }),
  )
}

type TestLoggerIncludes = ((string | RegExp) | {not: string | RegExp})[]

function setupUtilLogger(
  logger: IUtilLogger,
  audience: keyof ILogger['utilFor'],
  con: jest.Mocked<ITheatreConsoleLogger>,
) {
  return {
    named(name: string, key?: string) {
      return setupUtilLogger(logger.named(name, key), audience, con)
    },
    expectExcluded(kind: keyof IUtilLogger) {
      try {
        const message = `${audience} ${kind} message`
        logger[kind](message)
        expect(con.debug).not.toBeCalled()
        expect(con.info).not.toBeCalled()
        expect(con.warn).not.toBeCalled()
        expect(con.error).not.toBeCalled()
      } catch (err) {
        throw new LoggerTestError(
          `Expected "${audience}" logger.${kind}(...) excluded from logging\n${(
            err as Error
          ).toString()}`,
        )
      }
    },
    expectIncluded(
      kind: keyof IUtilLogger,
      expectOutputted: keyof ITheatreConsoleLogger,
      includes: TestLoggerIncludes = [],
    ) {
      try {
        const message = `${audience} ${kind} message`
        logger[kind](message)
        if (expectOutputted !== 'debug') {
          expect(con.debug).not.toBeCalled()
        }
        if (expectOutputted !== 'info') {
          expect(con.info).not.toBeCalled()
        }
        if (expectOutputted !== 'warn') {
          expect(con.warn).not.toBeCalled()
        }
        if (expectOutputted !== 'error') {
          expect(con.error).not.toBeCalled()
        }
        expectLastCalledWith(con[expectOutputted], includes)
      } catch (err) {
        throw new LoggerTestError(
          `Expected "${audience}" logger.${kind}(...) included and outputted via console.${expectOutputted}(...)\n${(
            err as Error
          ).toString()}`,
        )
      }
      con[expectOutputted].mockReset()
    },
  }
}

function spyConsole(): jest.Mocked<ITheatreConsoleLogger> {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }
}

// remove these lines from thrown errors
const AT_NODE_INTERNAL_RE = /^\s*at.+node:internal.+/gm
const AT_TEST_HELPERS_RE = /^\s*(at|[^@]+@).+test\-helpers.+/gm

/** `TestError` removes the invariant line & test-helpers from the `Error.stack` */
class LoggerTestError extends Error {
  found: any
  constructor(message: string, found?: any) {
    super(message)
    if (found) {
      this.found = found
    }
    // const before = this.stack
    // prettier-ignore
    this.stack = this.stack
      ?.replace(AT_TEST_HELPERS_RE, "")
      .replace(AT_NODE_INTERNAL_RE, "")
    // console.error({ before, after: this.stack })
  }
}
