## How to deploy

Simply update the version of `theatre/package.json`, then run `$ yarn run deploy`. This script will:
1. Update the version of `@theatre/core` and `@theatre/studio`.
2. Bundle the `.js` and `.dts` files.
3. Publish both packages to npm.