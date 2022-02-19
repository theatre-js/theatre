## How to release

Simply update the version of `theatre/package.json`, then run `$ yarn run release`. This script will:
1. Update the version of `@theatre/core` and `@theatre/studio` and other dependencies.
2. Bundle the `.js` and `.dts` files.
3. Publish all packages to npm.

Packages added to theatre/package.json will be bundled with studio, packages added to package.json of sub-packages will be treated as their externals.