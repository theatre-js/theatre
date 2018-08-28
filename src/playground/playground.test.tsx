import StoreAndStuff from '$lb/bootstrap/StoreAndStuff'
import {take, fork, put, actionChannel, call} from 'redux-saga/effects'
import {delay, channel, buffers} from 'redux-saga'

describe(`playground`, () => {
  it.skip(`should work`, async () => {
    const s = new StoreAndStuff({
      rootReducer: (s = {}) => s,
      rootSaga: null as $IntentionalAny,
    })

    let num = 0
    function* catchLuals(cch: $FixMe): Generator {
      const myNum = num++
      // const ch = yield actionChannel(cch)
      while (true) {
        const a = yield take(cch)
        console.log(`${myNum}: took`, a)
        // yield delay(2)
      }
    }

    const multicastChannel = () => {
      const ch = channel()
    }

    await s.sagaMiddleware.run(function*(): Generator {
      const ch = channel()
      yield fork(catchLuals, ch)
      yield fork(catchLuals, ch)

      yield put(ch, {type: 'lual', payload: 1})
      yield put(ch, {type: 'lual', payload: 2})
    }).done
  })
})
