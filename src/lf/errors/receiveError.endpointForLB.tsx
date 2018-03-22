function* receiveError(
  request: ErrorFromLBRequest,
): Generator_<$FixMe, $FixMe, $FixMe> {
  request.respond('received')
  throw new Error('Implement me')
}
