function* receiveError(request: ErrorFromLBRequest): Generator_<$FixMe> {
  request.respond('received')
  throw new Error('Implement me')
}
