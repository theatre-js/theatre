// @flow

export function* isPathAProject(params: {path: string}): Generator<*, *, boolean> {
  console.log('isProject', params)
}

export function* recogniseProject(params: {path: string}): Generator<*, *, {type: 'ok'} | {type: 'error', message: string}> {
  console.log('recognize', params)
}

export function* createNewProject(params: {path: string, name: string}): Generator<*, *, {type: 'ok'} | {type: 'error', message: string}> {
  console.log('create new', params)
}

export function* unrecognizeProject(params: {path: string}): Generator<*, *, {type: 'ok'} | {type: 'error', message: string}> {
  console.log('unrecognize', params)
}