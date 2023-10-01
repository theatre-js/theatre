import * as envSchema from './envSchema'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as yaml from 'yaml'

describe(`@theatre/app env`, () => {
  describe(`.env files`, () => {
    test(`.env.example should be valid`, () => {
      const pathToEnvExample = path.join(__dirname, '../.env.example')
      const envAsString = fs.readFileSync(pathToEnvExample, {encoding: 'utf8'})
      // this should use an INI parser
      const envAsObject = dotenv.parse(envAsString)
      envSchema.devSchema.parse(envAsObject)
    })
    test(`.env should be valid (if it exists)`, () => {
      const pathToEnvExample = path.join(__dirname, '../.env')
      if (!fs.existsSync(pathToEnvExample)) {
        return
      }
      const envAsString = fs.readFileSync(pathToEnvExample, {encoding: 'utf8'})
      // this should use an INI parser
      const envAsObject = dotenv.parse(envAsString)
      envSchema.devSchema.parse(envAsObject)
    })
  })
  describe(`render.yaml`, () => {
    test(`should include all the env variables required by the production schema`, () => {
      const pathToRenderYaml = path.join(__dirname, '../../../render.yaml')
      const yamlContent = yaml.parse(
        fs.readFileSync(pathToRenderYaml, {encoding: 'utf8'}),
      )

      const appService = yamlContent.services.find(
        (service: any) => service.name === 'app',
      )

      if (!appService) {
        throw new Error(`app service not found`)
      }

      const envVars: Array<{key: string}> = appService.envVars
      const envVarKeys = envVars.map((envVar) => envVar.key)
      // PORT is automatically added by render
      envVarKeys.push('PORT')

      const requiredKeys = Object.keys(envSchema.productionSchema.shape)

      envVarKeys.sort()
      requiredKeys.sort()

      // make sure envVarKeys and requiredKeys have all the same values, and no more
      expect(envVarKeys).toEqual(requiredKeys)
    })
  })
})
