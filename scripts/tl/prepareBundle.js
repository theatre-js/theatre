const fs = require('fs')
const path = require('path')

const fromRoot = s => path.join(__dirname, '../..', s)
const fromBundles = s => fromRoot('bundles/tl/' + s)
const fromDist = s => fromRoot('distributions/theatre/' + s)
;['index.js', 'core.js'].forEach(filename => {
  if (fs.existsSync(fromDist(filename))) fs.unlinkSync(fromDist(filename))
  fs.copyFileSync(fromBundles(filename), fromDist(filename))
  const content = fs.readFileSync(fromDist(filename), {encoding: 'utf-8'})
  const lines = content.split('\n')
  lines.pop()
  fs.writeFileSync(fromDist(filename), lines.join('\n'), {encoding: 'utf-8'})
})

const packageJson = JSON.parse(fs.readFileSync(fromDist('package.json')))
packageJson.version = require('../../package.json').version
fs.writeFileSync(
  fromDist('package.json'),
  JSON.stringify(packageJson, null, 2),
  {
    encoding: 'utf-8',
  },
)
