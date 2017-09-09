// @flow

export default function* ping(request: $FixMe): Generator<*, *, *> {
  yield null
  return `your request payload was ${request.payload}. Response is: 'pong!'`
}