import path from 'path'
import fs from 'fs'

describe(`Compat tests`, () => {
  test(`all fixtures should have an App/ directory identical to that of vite4's`, async () => {
    const vite4AppDir = path.join(__dirname, './fixtures/vite4/package/src/App')

    const vite4FilesContents = fs
      .readdirSync(vite4AppDir)
      .map((file) => [
        file,
        fs.readFileSync(path.join(vite4AppDir, file), 'utf-8'),
      ])

    const allFixtures = fs
      .readdirSync(path.join(__dirname, './fixtures'))
      .filter(
        (fixture) =>
          fixture !== 'vite4' &&
          // item is a folder
          fs
            .lstatSync(path.join(__dirname, './fixtures', fixture))
            .isDirectory(),
      )

    for (const fixture of allFixtures) {
      const appDir = path.join(
        __dirname,
        `./fixtures/${fixture}/package/src/App`,
      )
      if (!fs.existsSync(appDir)) {
        throw new Error(`Fixture ${fixture} does not have an App/ directory`)
      }
      for (const [file, contents] of vite4FilesContents) {
        const fixtureFileContents = fs.readFileSync(
          path.join(appDir, file),
          'utf-8',
        )
        if (fixtureFileContents !== contents) {
          throw new Error(
            `The file ${file} in fixture ${fixture} is not identical to that of vite4's`,
          )
        }
      }
    }
  })
})
