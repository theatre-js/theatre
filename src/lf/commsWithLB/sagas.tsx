import {Channel, eventChannel} from 'redux-saga'
import {call, take, fork} from 'redux-saga/effects'
import allEndpointsForLB from '$src/lf/commsWithLB/allEndpointsForLB'
import generateUniqueId from 'uuid/v4'
import wn from 'when'
import {ipcRenderer} from 'electron'
import {defer} from '$shared/utils/defer'

interface RequestFromLB {
  type: string
  id: string
  payload: mixed
  respond(payload: mixed): void
}

const getChannelOfRequestsFromLB = (): Channel<RequestFromLB> => {
  return eventChannel(emitToChannel => {
    const listener = (
      _event: mixed,
      request: {
        type: string
        id: string
        payload: mixed
      },
    ) => {
      let alreadyResponded = false
      const respond = (payload: mixed) => {
        if (alreadyResponded)
          throw new Error(
            `Request '${request.id}' to '${
              request.type
            }' is already responded to`,
          )

        alreadyResponded = true
        ipcRenderer.send('response', {id: request.id, payload})
      }

      const toEmit = {
        type: request.type,
        payload: request.payload,
        id: request.id,
        respond,
      }

      emitToChannel((toEmit as $IntentionalAny) as RequestFromLB)
    }

    // debugger
    ipcRenderer.on('request', listener)

    const unsubscribe = () => {
      ipcRenderer.removeListener('request', listener)
    }

    return unsubscribe
  })
}

/**
 * Sends a request to LB. Should only be used by makeLFCaller.
 */
function _sendRequestToLB(
  type: string,
  payload: mixed,
  thePromise: 'I promise this call is coming from callerFromLFToLB()',
): Promise<mixed> {
  if (thePromise !== 'I promise this call is coming from callerFromLFToLB()') {
    throw new Error(
      `sendRequestToMain() is only supposed to be called through \`makeLFCaller()\`.
      This ensures that all the calls to LB are properly typed. Look for any file 
      suffixed with '.caller.tsx' to see how this should work`,
    )
  }
  const request = {
    id: generateUniqueId(),
    type,
    payload,
  }

  const payloadDeferred = defer<mixed>()

  const listener = (
    _event: mixed,
    response: {
      id: string
      payload: mixed
    },
  ) => {
    if (response.id === request.id) {
      ipcRenderer.removeListener('response', listener)
      payloadDeferred.resolve(response.payload)
    }
  }

  ipcRenderer.on('response', listener)
  ipcRenderer.send('request', request)

  // @ts-ignore @ignore
  return payloadDeferred.promise
}

export const callerFromLFToLB = (handlerName: string): any => {
  const fn: any = function*(
    payload: $FixMe,
  ): Generator_<$FixMe, $FixMe, $FixMe> {
    const r: any = yield call(
      _sendRequestToLB,
      handlerName,
      payload,
      'I promise this call is coming from callerFromLFToLB()',
    )
    return r
  }

  return fn
}

export default function* commsWithLBSaga(): Generator_<$FixMe, $FixMe, $FixMe> {
  const requestsFromLB: Channel<RequestFromLB> = yield call(
    getChannelOfRequestsFromLB,
  )

  while (true) {
    const request: RequestFromLB = yield take(requestsFromLB)

    const endpointHandler = allEndpointsForLB[request.type]
    if (endpointHandler) {
      yield fork(handleRequestFromLB, endpointHandler, request)
    } else {
      throw Error(`Unkown request type received from LB '${request.type}'`)
    }
  }
}

function* handleRequestFromLB(
  handler: Function,
  request: RequestFromLB,
): Generator_<$FixMe, $FixMe, $FixMe> {
  try {
    // @ts-ignore @ignore
    const result = yield call(handler, request.payload)
    // @ts-ignore @ignore
    request.respond(result)
    return
  } catch (e) {
    console.error(e) // @todo log this somewhere
    // @ts-ignore @ignore
    request.respond({type: 'error', errorType: 'unkown'})
    return
  }
}
