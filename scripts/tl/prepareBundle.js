const fs = require('fs')
const path = require('path')

const fromRoot = s => path.join(__dirname, '../..', s)
const fromBundles = s => fromRoot('bundles/tl/' + s)
const fromDist = s => fromRoot('distributions/theatre/' + s)

// console.log(fromDist('hi'))

fs.unlinkSync(fromDist('index.js'))
fs.unlinkSync(fromDist('core.js'))
fs.copyFileSync(fromBundles('index.js'), fromDist('index.js'))
fs.copyFileSync(fromBundles('core.js'), fromDist('core.js'))

const packageJson = JSON.parse(fs.readFileSync(fromDist('package.json')))
packageJson.version = require('../../package.json').version
fs.writeFileSync(
  fromDist('package.json'),
  JSON.stringify(packageJson, null, 2),
  {
    encoding: 'utf-8',
  },
)
