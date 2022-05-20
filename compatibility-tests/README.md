# Compatibility tests

This setup helps us test whether Theatre.js is compatible with popular tools in the JS ecosystem, such as Vite, webpack, react, vue, etc.

> This setup is 3/10 complete.

The currentr workflow is:

1. Run a local npm registry, and build and publish the @theatre/* packages to it. All packages will have the 0.0.1-COMPAT.1 version
   
  ```sh
  yarn workspace @theatre/compatibility-tests run registry:start
  ```

  This script will keep running until it is terminated. While running, npm will be configured to point to the local registry that contains the `@theatre/*@0.0.1-COMPAT.1` packages.

2. `cd` into any test project (either use those in `./test-*` or make a new npm package elsewhere via `npm init`.)
3. Install `@theatre/*` from the local registry:

  ```sh
  npm install @theatre/core@0.0.1-COMPAT.1 @theatre/studio@0.0.1-COMPAT.1 @theatre/r3f@0.0.1-COMPAT.1
  ```

4. Test your local build of Thatre.js against your setup by manually building, running a dev server, and using Theatre.js on a browser pointing to the dev server.


Inspired by the
[#help channel on our Discord](https://discord.com/channels/870988717190426644/870988717190426647)
we collect examples for including `Theatre.js` in project that use different
tools (`parcel`, `Next.js`, `vanilla Rollup`, etc...) to build them in the CI
(these are the _compatibility tests_).

> **Gotchas**
> Some bundlers like webpack are not configured to work well with yarn workspaces by default. For example, the webpack config of create-react-app, tries to look up the node_modules chain to find missing dependencies, which is not a behavior that we want in build-tests setups. So if a setup doesn't work, try running it outside the monorepo to see if being in the monorepo is what's causing it to fail.