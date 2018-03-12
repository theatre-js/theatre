

export default function* ping(
  request: $FixMe,
): Generator_<$FixMe, $FixMe, $FixMe> {
  yield null
  return `Here is a response from lb. Your request payload was ${request.payload}. Response is: 'pong!'`
}
