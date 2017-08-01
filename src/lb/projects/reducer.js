// @flow
import type {ProjectsNamespaceState} from './types'

const defaultState: ProjectsNamespaceState = {
  listOfPaths: [],
  byPath: {},
}

export default (state: ProjectsNamespaceState = defaultState) => state