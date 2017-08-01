// @flow

export function* isPathAProject(params: {path: string}): Generator<*, *, boolean> {

}

export function* recogniseProject(params: {path: string}): Generator<*, *, {type: 'ok'} | {type: 'error', message: string}> {

}

export function* createNewProject(params: {path: string, name: string}): Generator<*, *, {type: 'ok'} | {type: 'error', message: string}> {

}

export function* unrecognizeProject(params: {path: string}): Generator<*, *, {type: 'ok'} | {type: 'error', message: string}> {

}