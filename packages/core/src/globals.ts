export const globals = {
  /**
   * If the schema of the redux store changes in a backwards-incompatible way, then this version number should be incremented.
   *
   * While this looks like semver, it is not. There are no patch numbers, so any change in this number is a breaking change.
   *
   * However, as long as the schema of the redux store is backwards-compatible, then we don't have to change this number.
   *
   * Since the 0.4.0 release, this number has not had to change.
   */
  currentProjectStateDefinitionVersion: '0.4.0',
}

/**
 * The names of the global variables that the core or studio bundle
 * use to store their references.
 */
export const globalVariableNames = {
  StudioBundle: '__TheatreJS_StudioBundle',
  coreBundle: '__TheatreJS_CoreBundle',
  notifications: '__TheatreJS_Notifications',
} as const

// This type is easier to import by the studio, since studio can only import types from `@theatre/core/*`
export type GlobalVariableNames = typeof globalVariableNames
