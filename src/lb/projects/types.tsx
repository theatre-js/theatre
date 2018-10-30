// @todo maybe opaque types here would be more suitable?

export type ProjectPath = string
export interface StuffInTheatreJsonFile {
  name: string
}

export type ProjectLoadingStateErrors =
  | {loadingState: 'error'; errorType: 'fileCantBeRead'; message: string}
  | {loadingState: 'error'; errorType: 'jsonCantBeParsed'; message: string}
  | {loadingState: 'error'; errorType: 'invalidJsonSchema'; message: string}

export type ProjectDescription =
  | {loadingState: 'loading'}
  | ProjectLoadingStateErrors
  | ({
      loadingState: 'loaded'
    } & StuffInTheatreJsonFile)

export type ProjectsNamespaceState = {
  // If a project is mentioned in `byPath` but isn't here, it means it is yet to be loaded
  listOfPaths: Array<ProjectPath>
  byPath: {[id: string]: ProjectDescription}
}
