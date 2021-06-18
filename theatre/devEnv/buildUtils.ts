export const definedGlobals = {
  global: 'window',
  'process.env.version': JSON.stringify(
    require('../studio/package.json').version,
  ),
}
