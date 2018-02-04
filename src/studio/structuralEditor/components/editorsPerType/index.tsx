import * as _ from 'lodash'

// $FlowIgnore
const context = require.context(
  './',
  true,
  /\.\/([a-zA-Z]+)Editor\/([a-zA-Z]+)Editor\.tsx$/,
)
const listOfModulePaths: Array<string> = context.keys()
const requireModuleByPath: typeof require = context
const components = _.mapValues(
  _.keyBy(listOfModulePaths, s => {
    const matches: Array<string> = s.match(
      /\/([a-zA-Z]+)Editor\/([a-zA-Z]+)Editor\.tsx$/,
    ) as $IntentionalAny
    return matches[1]
  }),
  localePath => requireModuleByPath(localePath).default,
)

export default components
