/** @public configuration type */
export interface ITheatreLogger {
  error(level: ITheatreLogMeta, message: string, args?: Loggable): void
  warn(level: ITheatreLogMeta, message: string, args?: Loggable): void
  debug(level: ITheatreLogMeta, message: string, args?: Loggable): void
  trace(level: ITheatreLogMeta, message: string, args?: Loggable): void
}

type ITheatreLogMeta = Readonly<{
  audience: 'public' | 'dev' | 'internal'
  category: 'general' | 'todo' | 'troubleshooting'
  level: TheatreLoggerLevel
}>

/** @public configuration type */
export interface ITheatreConsoleLogger {
  /** ERROR level logs */
  error(message: string, ...args: any[]): void
  /** WARN level logs */
  warn(message: string, ...args: any[]): void
  /** DEBUG level logs */
  info(message: string, ...args: any[]): void
  /** TRACE level logs */
  debug(message: string, ...args: any[]): void
}

/**
 * "Downgraded" {@link ILogger} for passing down to utility functions.
 *
 * A util logger is usually back by some specific {@link _Audience}.
 */
export interface IUtilLogger {
  /** Usually equivalent to `console.error`. */
  error(message: string, args?: object): void
  /** Usually equivalent to `console.warn`. */
  warn(message: string, args?: object): void
  /** Usually equivalent to `console.info`. */
  debug(message: string, args?: object): void
  /** Usually equivalent to `console.debug`. */
  trace(message: string, args?: object): void
  named(name: string, key?: string): IUtilLogger
}

type Loggable = Record<string, any>
type LogFn = (message: string, args?: Loggable) => void
/**
 * Allow for the arguments to only be computed if the level is included.
 * If the level is not included, then the fn will still be passed to the filtered
 * function.
 */
type LazyLogFn = (message: string, args: () => Loggable) => void

function lazy(f: LogFn): LazyLogFn {
  return function lazyLogIncluded(m, lazyArg) {
    return f(m, lazyArg())
  }
}

export type _LogFns = Readonly<
  {
    [P in keyof typeof LEVELS]: LogFn
  }
>

export type _LazyLogFns = Readonly<
  {
    [P in keyof typeof LEVELS]: LazyLogFn
  }
>

/** Internal library logger
 * TODO document these fns
 */
export interface ILogger extends _LogFns {
  named(name: string, key?: string | number): ILogger
  lazy: _LazyLogFns
  readonly utilFor: {
    internal(): IUtilLogger
    dev(): IUtilLogger
    public(): IUtilLogger
  }
}

export type ITheatreLoggerConfig =
  | /** default {@link console} */
  'console'
  | {
      type: 'console'
      /** default `true` */
      style?: boolean
      /** default {@link console} */
      console?: ITheatreConsoleLogger
    }
  | {
      type: 'named'
      named(names: string[]): ITheatreLogger
    }
  | {
      type: 'keyed'
      keyed(
        nameAndKeys: {
          name: string
          key?: string | number
        }[],
      ): ITheatreLogger
    }

export type ITheatreLogSource = {names: {name: string; key?: number | string}[]}

export type ITheatreLogIncludes = {
  /**
   * General information max level.
   * e.g. `Project imported might be corrupted`
   */
  min?: TheatreLoggerLevel
  /**
   * Include logs meant for developers using Theatre.js
   * e.g. `Created new project 'Abc' with options {...}`
   *
   * defaults to `true` if `internal: true` or defaults to `false`.
   */
  dev?: boolean
  /**
   * Include logs meant for internal development of Theatre.js
   * e.g. `Migrated project 'Abc' { duration_ms: 34, from_version: 1, to_version: 3, imported_settings: false }`
   *
   * defaults to `false`
   */
  internal?: boolean
}

export type ITheatreLoggingConfig = ITheatreLogIncludes & {
  include?: (source: ITheatreLogSource) => ITheatreLogIncludes
  consoleStyle?: boolean
}

/** @internal */
enum _Category {
  GENERAL = 1 << 0,
  TODO = 1 << 1,
  TROUBLESHOOTING = 1 << 2,
}

/** @internal */
enum _Audience {
  /** Logs for developers of Theatre.js */
  INTERNAL = 1 << 3,
  /** Logs for developers using Theatre.js */
  DEV = 1 << 4,
  /** Logs for users of the app using Theatre.js */
  PUBLIC = 1 << 5,
}

export enum TheatreLoggerLevel {
  TRACE = 1 << 6,
  DEBUG = 1 << 7,
  WARN = 1 << 8,
  ERROR = 1 << 9,
}

/**
 * @internal Theatre.js internal "dev" levels are odd numbers
 *
 * You can check if a level is odd quickly by doing `level & 1 === 1`
 */
export enum _LoggerLevel {
  /** The highest logging level number. */
  ERROR_PUBLIC = TheatreLoggerLevel.ERROR |
    _Audience.PUBLIC |
    _Category.GENERAL,
  ERROR_DEV = TheatreLoggerLevel.ERROR | _Audience.DEV | _Category.GENERAL,
  /** @internal this was an unexpected event */
  _HMM = TheatreLoggerLevel.ERROR |
    _Audience.INTERNAL |
    _Category.TROUBLESHOOTING,
  _TODO = TheatreLoggerLevel.ERROR | _Audience.INTERNAL | _Category.TODO,
  _ERROR = TheatreLoggerLevel.ERROR | _Audience.INTERNAL | _Category.GENERAL,
  WARN_PUBLIC = TheatreLoggerLevel.WARN | _Audience.PUBLIC | _Category.GENERAL,
  WARN_DEV = TheatreLoggerLevel.WARN | _Audience.DEV | _Category.GENERAL,
  /** @internal surface this in this moment, but it probably shouldn't be left in the code after debugging. */
  _KAPOW = TheatreLoggerLevel.WARN |
    _Audience.INTERNAL |
    _Category.TROUBLESHOOTING,
  _WARN = TheatreLoggerLevel.WARN | _Audience.INTERNAL | _Category.GENERAL,
  DEBUG_DEV = TheatreLoggerLevel.DEBUG | _Audience.DEV | _Category.GENERAL,
  /** @internal debug logs for implementation details */
  _DEBUG = TheatreLoggerLevel.DEBUG | _Audience.INTERNAL | _Category.GENERAL,
  /** trace logs like when the project is saved */
  TRACE_DEV = TheatreLoggerLevel.TRACE | _Audience.DEV | _Category.GENERAL,
  /**
   * The lowest logging level number.
   * @internal trace logs for implementation details
   */
  _TRACE = TheatreLoggerLevel.TRACE | _Audience.INTERNAL | _Category.GENERAL,
}

const LEVELS = {
  _hmm: getLogMeta(_LoggerLevel._HMM),
  _todo: getLogMeta(_LoggerLevel._TODO),
  _error: getLogMeta(_LoggerLevel._ERROR),
  errorDev: getLogMeta(_LoggerLevel.ERROR_DEV),
  errorPublic: getLogMeta(_LoggerLevel.ERROR_PUBLIC),
  _kapow: getLogMeta(_LoggerLevel._KAPOW),
  _warn: getLogMeta(_LoggerLevel._WARN),
  warnDev: getLogMeta(_LoggerLevel.WARN_DEV),
  warnPublic: getLogMeta(_LoggerLevel.WARN_PUBLIC),
  _debug: getLogMeta(_LoggerLevel._DEBUG),
  debugDev: getLogMeta(_LoggerLevel.DEBUG_DEV),
  _trace: getLogMeta(_LoggerLevel._TRACE),
  traceDev: getLogMeta(_LoggerLevel.TRACE_DEV),
}

function getLogMeta(level: _LoggerLevel): ITheatreLogMeta {
  return Object.freeze({
    audience: hasFlag(level, _Audience.INTERNAL)
      ? 'internal'
      : hasFlag(level, _Audience.DEV)
      ? 'dev'
      : 'public',
    category: hasFlag(level, _Category.TROUBLESHOOTING)
      ? 'troubleshooting'
      : hasFlag(level, _Category.TODO)
      ? 'todo'
      : 'general',
    level:
      // I think this is equivalent... but I'm not using it until we have tests.
      // this code won't really impact performance much anyway, since it's just computed once
      // up front.
      // level &
      // (TheatreLoggerLevel.TRACE |
      //   TheatreLoggerLevel.DEBUG |
      //   TheatreLoggerLevel.WARN |
      //   TheatreLoggerLevel.ERROR),
      hasFlag(level, TheatreLoggerLevel.ERROR)
        ? TheatreLoggerLevel.ERROR
        : hasFlag(level, TheatreLoggerLevel.WARN)
        ? TheatreLoggerLevel.WARN
        : hasFlag(level, TheatreLoggerLevel.DEBUG)
        ? TheatreLoggerLevel.DEBUG
        : // no other option
          TheatreLoggerLevel.TRACE,
  })
}

/**
 * This is a helper function to determine whether the logger level has a bit flag set.
 *
 * Flags are interesting, because they give us an opportunity to very easily set up filtering
 * based on category and level. This is not available from public api, yet, but it's a good
 * start.
 */
function hasFlag(level: _LoggerLevel, flag: number): boolean {
  return (level & flag) === flag
}

/**
 * @internal
 *
 * You'd think max, means number "max", but since we use this system of bit flags,
 * we actually need to go the other way, with comparisons being math less than.
 *
 * NOTE: Keep this in the same file as {@link _Audience} to ensure basic compilers
 * can inline the enum values.
 */
function shouldLog(
  includes: Required<ITheatreLogIncludes>,
  level: _LoggerLevel,
) {
  return (
    ((level & _Audience.PUBLIC) === _Audience.PUBLIC
      ? true
      : (level & _Audience.DEV) === _Audience.DEV
      ? includes.dev
      : (level & _Audience.INTERNAL) === _Audience.INTERNAL
      ? includes.internal
      : false) && includes.min <= level
  )
}

export {shouldLog as _loggerShouldLog}

type InternalLoggerStyleRef = {
  italic?: RegExp
  bold?: RegExp
  color?: (name: string) => string
  collapseOnRE: RegExp
  cssMemo: Map<string, string>
  css(this: InternalLoggerStyleRef, name: string): string
  collapsed(this: InternalLoggerStyleRef, name: string): string
}

type InternalLoggerRef = {
  loggingConsoleStyle: boolean
  loggerConsoleStyle: boolean
  includes: Required<ITheatreLogIncludes>
  filtered: (
    this: ITheatreLogSource,
    level: _LoggerLevel,
    message: string,
    args?: Loggable | (() => Loggable),
  ) => void
  include: (obj: ITheatreLogSource) => ITheatreLogIncludes
  create: (obj: ITheatreLogSource) => ILogger
  creatExt: (obj: ITheatreLogSource) => ITheatreLogger
  style: InternalLoggerStyleRef
  named(
    this: InternalLoggerRef,
    parent: ITheatreLogSource,
    name: string,
    key?: number | string,
  ): ILogger
}

const DEFAULTS: InternalLoggerRef = {
  loggingConsoleStyle: true,
  loggerConsoleStyle: true,
  includes: Object.freeze({
    internal: false,
    dev: false,
    min: TheatreLoggerLevel.WARN,
  }),
  filtered: function defaultFiltered() {},
  include: function defaultInclude() {
    return {}
  },
  create: null!,
  creatExt: null!,
  named(this: InternalLoggerRef, parent, name, key) {
    return this.create({
      names: [...parent.names, {name, key}],
    })
  },
  style: {
    bold: undefined, // /Service$/
    italic: undefined, // /Model$/
    cssMemo: new Map<string, string>([
      // handle empty names so we don't have to check for
      // name.length > 0 during this.css('')
      ['', ''],
      // bring a specific override
      // ["Marker", "color:#aea9ff;font-size:0.75em;text-transform:uppercase"]
    ]),
    collapseOnRE: /[a-z- ]+/g,
    color: undefined,
    // create collapsed name
    // insert collapsed name into cssMemo with original's style
    collapsed(this, name) {
      if (name.length < 5) return name
      const collapsed = name.replace(this.collapseOnRE, '')
      if (!this.cssMemo.has(collapsed)) {
        this.cssMemo.set(collapsed, this.css(name))
      }
      return collapsed
    },
    css(this, name): string {
      const found = this.cssMemo.get(name)
      if (found) return found
      let css = `color:${
        this.color?.(name) ??
        `hsl(${
          (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % 360
        }, 100%, 60%)`
      }`
      if (this.bold?.test(name)) {
        css += ';font-weight:600'
      }
      if (this.italic?.test(name)) {
        css += ';font-style:italic'
      }
      this.cssMemo.set(name, css)
      return css
    },
  },
}

/** @internal */
export type ITheatreInternalLogger = {
  configureLogger(config: ITheatreLoggerConfig): void
  configureLogging(config: ITheatreLoggingConfig): void
  getLogger(): ILogger
}

export type ITheatreInternalLoggerOptions = {
  _error?: (message: string, args?: object) => void
  _debug?: (message: string, args?: object) => void
}

export function createTheatreInternalLogger(
  useConsole: ITheatreConsoleLogger = console,
  // Not yet, used, but good pattern to have in case we want to log something
  // or report something interesting.
  _options: ITheatreInternalLoggerOptions = {},
): ITheatreInternalLogger {
  const ref: InternalLoggerRef = {...DEFAULTS, includes: {...DEFAULTS.includes}}
  const createConsole = {
    styled: createConsoleLoggerStyled.bind(ref, useConsole),
    noStyle: createConsoleLoggerNoStyle.bind(ref, useConsole),
  }
  const createExtBound = createExtLogger.bind(ref)
  function getConCreate() {
    return ref.loggingConsoleStyle && ref.loggerConsoleStyle
      ? createConsole.styled
      : createConsole.noStyle
  }
  ref.create = getConCreate()

  return {
    configureLogger(config) {
      if (config === 'console') {
        ref.loggerConsoleStyle = DEFAULTS.loggerConsoleStyle
        ref.create = getConCreate()
      } else if (config.type === 'console') {
        ref.loggerConsoleStyle = config.style ?? DEFAULTS.loggerConsoleStyle
        ref.create = getConCreate()
      } else if (config.type === 'keyed') {
        ref.creatExt = (source) => config.keyed(source.names)
        ref.create = createExtBound
      } else if (config.type === 'named') {
        ref.creatExt = configNamedToKeyed.bind(null, config.named)
        ref.create = createExtBound
      }
    },
    configureLogging(config) {
      ref.includes.dev = config.dev ?? DEFAULTS.includes.dev
      ref.includes.internal = config.internal ?? DEFAULTS.includes.internal
      ref.includes.min = config.min ?? DEFAULTS.includes.min
      ref.include = config.include ?? DEFAULTS.include
      ref.loggingConsoleStyle =
        config.consoleStyle ?? DEFAULTS.loggingConsoleStyle
      ref.create = getConCreate()
    },
    getLogger() {
      return ref.create({names: []})
    },
  }
}

/** used by `configureLogger` for `'named'` */
function configNamedToKeyed(
  namedFn: (names: string[]) => ITheatreLogger,
  source: ITheatreLogSource,
): ITheatreLogger {
  const names: string[] = []
  for (let {name, key} of source.names) {
    names.push(key == null ? name : `${name} (${key})`)
  }
  return namedFn(names)
}

function createExtLogger(
  this: InternalLoggerRef,
  source: ITheatreLogSource,
): ILogger {
  const includes = {...this.includes, ...this.include(source)}
  const f = this.filtered
  const named = this.named.bind(this, source)
  const ext = this.creatExt(source)

  const _HMM = shouldLog(includes, _LoggerLevel._HMM)
  const _TODO = shouldLog(includes, _LoggerLevel._TODO)
  const _ERROR = shouldLog(includes, _LoggerLevel._ERROR)
  const ERROR_DEV = shouldLog(includes, _LoggerLevel.ERROR_DEV)
  const ERROR_PUBLIC = shouldLog(includes, _LoggerLevel.ERROR_PUBLIC)
  const _WARN = shouldLog(includes, _LoggerLevel._WARN)
  const _KAPOW = shouldLog(includes, _LoggerLevel._KAPOW)
  const WARN_DEV = shouldLog(includes, _LoggerLevel.WARN_DEV)
  const WARN_PUBLIC = shouldLog(includes, _LoggerLevel.WARN_PUBLIC)
  const _DEBUG = shouldLog(includes, _LoggerLevel._DEBUG)
  const DEBUG_DEV = shouldLog(includes, _LoggerLevel.DEBUG_DEV)
  const _TRACE = shouldLog(includes, _LoggerLevel._TRACE)
  const TRACE_DEV = shouldLog(includes, _LoggerLevel.TRACE_DEV)
  const _hmm = _HMM
    ? ext.error.bind(ext, LEVELS._hmm)
    : f.bind(source, _LoggerLevel._HMM)
  const _todo = _TODO
    ? ext.error.bind(ext, LEVELS._todo)
    : f.bind(source, _LoggerLevel._TODO)
  const _error = _ERROR
    ? ext.error.bind(ext, LEVELS._error)
    : f.bind(source, _LoggerLevel._ERROR)
  const errorDev = ERROR_DEV
    ? ext.error.bind(ext, LEVELS.errorDev)
    : f.bind(source, _LoggerLevel.ERROR_DEV)
  const errorPublic = ERROR_PUBLIC
    ? ext.error.bind(ext, LEVELS.errorPublic)
    : f.bind(source, _LoggerLevel.ERROR_PUBLIC)
  const _kapow = _KAPOW
    ? ext.warn.bind(ext, LEVELS._kapow)
    : f.bind(source, _LoggerLevel._KAPOW)
  const _warn = _WARN
    ? ext.warn.bind(ext, LEVELS._warn)
    : f.bind(source, _LoggerLevel._WARN)
  const warnDev = WARN_DEV
    ? ext.warn.bind(ext, LEVELS.warnDev)
    : f.bind(source, _LoggerLevel.WARN_DEV)
  const warnPublic = WARN_PUBLIC
    ? ext.warn.bind(ext, LEVELS.warnPublic)
    : f.bind(source, _LoggerLevel.WARN_DEV)
  const _debug = _DEBUG
    ? ext.debug.bind(ext, LEVELS._debug)
    : f.bind(source, _LoggerLevel._DEBUG)
  const debugDev = DEBUG_DEV
    ? ext.debug.bind(ext, LEVELS.debugDev)
    : f.bind(source, _LoggerLevel.DEBUG_DEV)
  const _trace = _TRACE
    ? ext.trace.bind(ext, LEVELS._trace)
    : f.bind(source, _LoggerLevel._TRACE)
  const traceDev = TRACE_DEV
    ? ext.trace.bind(ext, LEVELS.traceDev)
    : f.bind(source, _LoggerLevel.TRACE_DEV)
  const logger: ILogger = {
    _hmm,
    _todo,
    _error,
    errorDev,
    errorPublic,
    _kapow,
    _warn,
    warnDev,
    warnPublic,
    _debug,
    debugDev,
    _trace,
    traceDev,
    lazy: {
      _hmm: _HMM ? lazy(_hmm) : _hmm,
      _todo: _TODO ? lazy(_todo) : _todo,
      _error: _ERROR ? lazy(_error) : _error,
      errorDev: ERROR_DEV ? lazy(errorDev) : errorDev,
      errorPublic: ERROR_PUBLIC ? lazy(errorPublic) : errorPublic,
      _kapow: _KAPOW ? lazy(_kapow) : _kapow,
      _warn: _WARN ? lazy(_warn) : _warn,
      warnDev: WARN_DEV ? lazy(warnDev) : warnDev,
      warnPublic: WARN_PUBLIC ? lazy(warnPublic) : warnPublic,
      _debug: _DEBUG ? lazy(_debug) : _debug,
      debugDev: DEBUG_DEV ? lazy(debugDev) : debugDev,
      _trace: _TRACE ? lazy(_trace) : _trace,
      traceDev: TRACE_DEV ? lazy(traceDev) : traceDev,
    },
    //
    named,
    utilFor: {
      internal() {
        return {
          debug: logger._debug,
          error: logger._error,
          warn: logger._warn,
          trace: logger._trace,
          named(name, key) {
            return logger.named(name, key).utilFor.internal()
          },
        }
      },
      dev() {
        return {
          debug: logger.debugDev,
          error: logger.errorDev,
          warn: logger.warnDev,
          trace: logger.traceDev,
          named(name, key) {
            return logger.named(name, key).utilFor.dev()
          },
        }
      },
      public() {
        return {
          error: logger.errorPublic,
          warn: logger.warnPublic,
          debug(message, obj) {
            logger._warn(`(public "debug" filtered out) ${message}`, obj)
          },
          trace(message, obj) {
            logger._warn(`(public "trace" filtered out) ${message}`, obj)
          },
          named(name, key) {
            return logger.named(name, key).utilFor.public()
          },
        }
      },
    },
  }

  return logger
}

function createConsoleLoggerStyled(
  this: InternalLoggerRef,
  con: ITheatreConsoleLogger,
  source: ITheatreLogSource,
): ILogger {
  const includes = {...this.includes, ...this.include(source)}

  const styleArgs: any[] = []
  let prefix = ''
  for (let i = 0; i < source.names.length; i++) {
    const {name, key} = source.names[i]
    prefix += ` %c${name}`
    styleArgs.push(this.style.css(name))
    if (key != null) {
      const keyStr = `%c#${key}`
      prefix += keyStr
      styleArgs.push(this.style.css(keyStr))
    }
  }

  const f = this.filtered
  const named = this.named.bind(this, source)
  const prefixArr = [prefix, ...styleArgs]
  return _createConsoleLogger(
    f,
    source,
    includes,
    con,
    prefixArr,
    styledKapowPrefix(prefixArr),
    named,
  )
}

function styledKapowPrefix(args: ReadonlyArray<string>): ReadonlyArray<string> {
  const start = args.slice(0)
  for (let i = 1; i < start.length; i++)
    // add big font to all part styles
    start[i] += ';background-color:#e0005a;padding:2px;color:white'
  return start
}

function createConsoleLoggerNoStyle(
  this: InternalLoggerRef,
  con: ITheatreConsoleLogger,
  source: ITheatreLogSource,
): ILogger {
  const includes = {...this.includes, ...this.include(source)}

  let prefix = ''
  for (let i = 0; i < source.names.length; i++) {
    const {name, key} = source.names[i]
    prefix += ` ${name}`
    if (key != null) {
      prefix += `#${key}`
    }
  }

  const f = this.filtered
  const named = this.named.bind(this, source)
  const prefixArr = [prefix]
  return _createConsoleLogger(
    f,
    source,
    includes,
    con,
    prefixArr,
    prefixArr,
    named,
  )
}

/** Used by {@link createConsoleLoggerNoStyle} and {@link createConsoleLoggerStyled} */
function _createConsoleLogger(
  f: (
    this: ITheatreLogSource,
    level: _LoggerLevel,
    message: string,
    args?: object | undefined,
  ) => void,
  source: ITheatreLogSource,
  includes: {min: TheatreLoggerLevel; dev: boolean; internal: boolean},
  con: ITheatreConsoleLogger,
  prefix: ReadonlyArray<any>,
  kapowPrefix: ReadonlyArray<any>,
  named: (name: string, key?: string | number | undefined) => ILogger,
) {
  const _HMM = shouldLog(includes, _LoggerLevel._HMM)
  const _TODO = shouldLog(includes, _LoggerLevel._TODO)
  const _ERROR = shouldLog(includes, _LoggerLevel._ERROR)
  const ERROR_DEV = shouldLog(includes, _LoggerLevel.ERROR_DEV)
  const ERROR_PUBLIC = shouldLog(includes, _LoggerLevel.ERROR_PUBLIC)
  const _WARN = shouldLog(includes, _LoggerLevel._WARN)
  const _KAPOW = shouldLog(includes, _LoggerLevel._KAPOW)
  const WARN_DEV = shouldLog(includes, _LoggerLevel.WARN_DEV)
  const WARN_PUBLIC = shouldLog(includes, _LoggerLevel.WARN_PUBLIC)
  const _DEBUG = shouldLog(includes, _LoggerLevel._DEBUG)
  const DEBUG_DEV = shouldLog(includes, _LoggerLevel.DEBUG_DEV)
  const _TRACE = shouldLog(includes, _LoggerLevel._TRACE)
  const TRACE_DEV = shouldLog(includes, _LoggerLevel.TRACE_DEV)
  const _hmm = _HMM
    ? con.error.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel._HMM)
  const _todo = _TODO
    ? con.error.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel._TODO)
  const _error = _ERROR
    ? con.error.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel._ERROR)
  const errorDev = ERROR_DEV
    ? con.error.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel.ERROR_DEV)
  const errorPublic = ERROR_PUBLIC
    ? con.error.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel.ERROR_PUBLIC)
  const _kapow = _KAPOW
    ? con.warn.bind(con, ...kapowPrefix)
    : f.bind(source, _LoggerLevel._KAPOW)
  const _warn = _WARN
    ? con.warn.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel._WARN)
  const warnDev = WARN_DEV
    ? con.warn.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel.WARN_DEV)
  const warnPublic = WARN_PUBLIC
    ? con.warn.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel.WARN_DEV)
  const _debug = _DEBUG
    ? con.info.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel._DEBUG)
  const debugDev = DEBUG_DEV
    ? con.info.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel.DEBUG_DEV)
  const _trace = _TRACE
    ? con.debug.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel._TRACE)
  const traceDev = TRACE_DEV
    ? con.debug.bind(con, ...prefix)
    : f.bind(source, _LoggerLevel.TRACE_DEV)
  const logger: ILogger = {
    _hmm,
    _todo,
    _error,
    errorDev,
    errorPublic,
    _kapow,
    _warn,
    warnDev,
    warnPublic,
    _debug,
    debugDev,
    _trace,
    traceDev,
    lazy: {
      _hmm: _HMM ? lazy(_hmm) : _hmm,
      _todo: _TODO ? lazy(_todo) : _todo,
      _error: _ERROR ? lazy(_error) : _error,
      errorDev: ERROR_DEV ? lazy(errorDev) : errorDev,
      errorPublic: ERROR_PUBLIC ? lazy(errorPublic) : errorPublic,
      _kapow: _KAPOW ? lazy(_kapow) : _kapow,
      _warn: _WARN ? lazy(_warn) : _warn,
      warnDev: WARN_DEV ? lazy(warnDev) : warnDev,
      warnPublic: WARN_PUBLIC ? lazy(warnPublic) : warnPublic,
      _debug: _DEBUG ? lazy(_debug) : _debug,
      debugDev: DEBUG_DEV ? lazy(debugDev) : debugDev,
      _trace: _TRACE ? lazy(_trace) : _trace,
      traceDev: TRACE_DEV ? lazy(traceDev) : traceDev,
    },
    //
    named,
    utilFor: {
      internal() {
        return {
          debug: logger._debug,
          error: logger._error,
          warn: logger._warn,
          trace: logger._trace,
          named(name, key) {
            return logger.named(name, key).utilFor.internal()
          },
        }
      },
      dev() {
        return {
          debug: logger.debugDev,
          error: logger.errorDev,
          warn: logger.warnDev,
          trace: logger.traceDev,
          named(name, key) {
            return logger.named(name, key).utilFor.dev()
          },
        }
      },
      public() {
        return {
          error: logger.errorPublic,
          warn: logger.warnPublic,
          debug(message, obj) {
            logger._warn(`(public "debug" filtered out) ${message}`, obj)
          },
          trace(message, obj) {
            logger._warn(`(public "trace" filtered out) ${message}`, obj)
          },
          named(name, key) {
            return logger.named(name, key).utilFor.public()
          },
        }
      },
    },
  }

  return logger
}
