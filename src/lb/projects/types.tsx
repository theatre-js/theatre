// @flow

// @todo maybe opaque types here would be more suitable?

export type ProjectId = string

export type ProjectPath = string

export type ProjectLoadingStateErrors =
  | {loadingState: 'error'; errorType: 'jsonCantBeParsed'; message: string}
  | {loadingState: 'error'; errorType: 'invalidJsonSchema'; message: string}

export type ProjectDescription =
  | {loadingState: 'loading'}
  | ProjectLoadingStateErrors
  | {
      loadingState: 'loaded'
      projectId: ProjectId
      name: string
    }

export type ProjectsNamespaceState = {
  // If a project is mentioned in `byPath` but isn't here, it means it is yet to be loaded
  listOfPaths: Array<ProjectPath>
  byPath: {[id: ProjectPath]: ProjectDescription}
}
