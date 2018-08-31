import * as _ from 'lodash-es'

const context = require.context('$lf/', true, /\.endpointForLB\.tsx$/)
const listOfModulePaths: Array<string> = context.keys()
const requireModuleByPath = context
const handlersByName = _.mapValues(
  _.keyBy(listOfModulePaths, s => {
    const matches: Array<string> = s.match(
      /\/([a-zA-Z]+)\.endpointForLB\.tsx$/,
    ) as $IntentionalAny
    return matches[1]
  }),
  localePath => requireModuleByPath(localePath).default,
)

export default handlersByName
