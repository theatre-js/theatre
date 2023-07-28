# Compatibility tests

This setup helps us test whether Theatre.js is compatible with popular tools in the JS ecosystem, such as Vite, Next.js, webpack, react, vue, etc.

## The directory structure

- `./fixtures` (contains the fixtures - read on for more details)
  - `parcel2-react18/`: The name of the fixture. This name means we're testing a minimal setup of Theatre.js alongside `parcel2` and `react18`. 
    - `package/`: This is the npm package that contains a minimal setup of `theatre+parcel2+react18`.
    - `production.compat-test.ts`: This is a jest test for creating a production build of this setup.
    - `*.compat-test.ts`: Any `.compat-test.ts` file will be picked up by jest, so you can use more files to test different aspects of the fixture.

## How to run the tests

1. First, we run `yarn run install-fixtures`, which tries to install Theatre.js on a fixture as if `@theatre/core|studio|r3f` were installed through npm. This script runs a [local npm registry](https://github.com/verdaccio/verdaccio) and publishes a production build of all the Theatre.js packages to it. Then, it iterates through `./fixtures/*/package` and runs `$ npm install` on them, using that local npm registry. 
  **If this step fails**, that usually means one of `@theatre/*` packages has a `dependency/peerDependency` that cannot be satisfied by `npm/yarn`. So this is always the first thing to fix.
1. Then, we run `$ yarn test:compat:run`, which will run jest on all of `*.compat-test.ts` files, each of which tests an aspect of a test setup.
2. Most of our fixtures don't actually have `.compat-test.ts` files, so we'll have to run them manually and see if Theatre still works in them, jut like a manual QA pass.

> **Gotchas**
> Some bundlers like webpack are not configured to work well with yarn workspaces by default. For example, the webpack config of create-react-app, tries to look up the node_modules chain to find missing dependencies, which is not a behavior that we want in build-tests setups. So if a setup doesn't work, try running it outside the monorepo to see if being in the monorepo is what's causing it to fail.