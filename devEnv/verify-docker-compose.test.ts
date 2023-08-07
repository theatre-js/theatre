import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'yaml'

describe(`Docker-compose`, () => {
  test(`should exclude all node_modules folders`, () => {
    const dockerComposeFile = fs.readFileSync(
      path.join(__dirname, '../docker-compose.yml'),
      {encoding: 'utf8'},
    )

    const yamlContent = yaml.parse(dockerComposeFile)
    const dockerVolumes = yamlContent.services['node'].volumes
    const dockerVolumesThatExludeNodeModules = dockerVolumes.filter(
      (volume: string) => volume.includes('node_modules'),
    )

    const allFoldersToExclude = findAllNodejsFoldersAt(
      path.join(__dirname, '..'),
    ).map((fullPath) => {
      return path.join(
        '/app',
        path.relative(path.join(__dirname, '..'), fullPath),
      )
    })

    const missingExclusions = allFoldersToExclude.filter(
      (folder) => !dockerVolumesThatExludeNodeModules.includes(folder),
    )

    if (missingExclusions.length > 0) {
      throw new Error(
        `Some node_modules folders are not excluded from docker-compose.yml. You should add them
        to the voluems section of the node service:\n${missingExclusions
          .map((s) => '- ' + s)
          .join('\n')}`,
      )
    }
  })
})

function findAllNodejsFoldersAt(dir: string): string[] {
  const files = fs.readdirSync(dir)
  const found: string[] = []
  for (const file of files) {
    if (file === 'package.json') {
      found.push(path.join(dir, 'node_modules'))
    } else if (file !== 'node_modules') {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        found.push(...findAllNodejsFoldersAt(filePath))
      }
    }
  }
  return found
}
