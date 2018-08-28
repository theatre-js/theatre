export default function* ping(payload: mixed): Generator_<$FixMe> {
  yield null
  return `Here is a response from lb. Your request payload was ${payload}. Response is: 'pong!'`
}
