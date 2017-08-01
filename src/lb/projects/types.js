// @flow

// @todo maybe opaque types here would be more suitable?

/**
 * isPathAProject({path: string}) => boolean
 * recogniseProject({path: string}) => {type: 'ok'} | {type: 'error', message: string}
 * createNewProject({path: string, name: string}) => {type: 'ok'} | {type: 'error', message: string}
 * unrecognizeProject({path: string}) => {type: 'ok'} | {type: 'error', message: string}
 */

export type ProjectID = string

export type ProjectPath = string

export type ProjectDescription = {
  id: ProjectID,
  path: ProjectPath,
  name: string,
}

export type ProjectsNamespaceState = {
  listOfPaths: Array<ProjectPath>,
  byPath: {[id: ProjectPath]: ProjectDescription},
}