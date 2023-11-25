export function allowCors(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set('Access-Control-Allow-Methods', '*')
  res.headers.set('Access-Control-Allow-Headers', '*')
}
