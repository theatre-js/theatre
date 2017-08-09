// @flow

export default function* ping(request: $FlowFixMe): Generator<> {
  yield null
  return `your request payload was ${request.payload}. Response is: 'pong!'`
}