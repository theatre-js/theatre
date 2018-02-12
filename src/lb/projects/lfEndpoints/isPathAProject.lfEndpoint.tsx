import * as fse from 'fs-extra'
import {call} from '$shared/utils/sagas'
import _ from 'lodash'
import path from 'path'

type ReturnType =
  | {type: 'ok', isIt: false}
  | {type: 'ok', isIt: true, filePath: string}
  | {type: 'error', message: string}

export default function* isPathAProject(params: {
  fileOrFolderPath: string,
}): Generator_<$FixMe, ReturnType, $FixMe> {
  // @ts-ignore  @todo
  if ((yield* call(fse.pathExists, params.fileOrFolderPath)) !== true) {
    return {type: 'ok', isIt: false}
  }

  if (_.endsWith(params.fileOrFolderPath, '/theaterjs.json')) {
    return {type: 'ok', isIt: true, filePath: params.fileOrFolderPath}
  }

  let pathStat
  try {
    // @ts-ignore @todo
    pathStat = yield* call(fse.stat, params.fileOrFolderPath)
  } catch (e) {
    console.error(e)
    return {type: 'error', message: `Path couldn't be read`}
  }

  if (pathStat.isDirectory()) {
    const pathToFile = path.join(params.fileOrFolderPath, 'theaterjs.json')
    // @ts-ignore @todo
    if ((yield* call(fse.pathExists, pathToFile)) === true)
      return {type: 'ok', isIt: true, filePath: pathToFile}
  }

  return {type: 'ok', isIt: false}
}
