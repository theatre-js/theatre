# Ecosystem tests

Inspired by the
[#help channel on our Discord](https://discord.com/channels/870988717190426644/870988717190426647)
we collect examples for including `Theatre.js` in project that use different
tools (`parcel`, `Next.js`, `vanilla Rollup`, etc...) to build them in the CI
(these are the _ecosystem tests_).

## The currently tested setups

| setup                        | tools                               | `package.json`                        |
| ---------------------------- | ----------------------------------- | ------------------------------------- |
| ecosystem-tests/create-react-app | `create-react-app`, `r3f extension` | [link](create-react-app/package.json) |

## Testing the configurations locally

1. **Build and publish the theatre packages to a local registry**

Run the following command in the root of the theatre monorepo:

```sh
# clean existing build artifacts
yarn clean
# build all theatre packags and publish them to yalc
yarn zx scripts/publish-to-yalc.mjs
```

2. **Install the dependencies of the setup**

Navigate into the directory of the selected configuration (`parcel_v2` in this
case) and install the dependencies of the setup:

```sh
cd ecosystem-tests/parcel_v2/
yarn
```

3. **Add the Theatre.js packages to the setup from the local registry**

```sh
yarn zx scripts/ecosystem-tests/link-theatre-packages.mjs
```

4. **Start the dev server**

```sh
yarn start
```

## Adding a new setup

If you wish to test a new setup (say Vite, or cool-new-bundler), here is how to
do it:

1. Build the monorepo packages and publish them to the local npm registry,
   [yalc](https://github.com/wclr/yalc).

   ```sh
   cd /path/to/theatre-monorepo
   # build all the packages
   yarn build
   # publish them to yalc (the local npm registry)
   zx scripts/publish-to-yalc.mjs
   ```

1. Start your new setup in a directory outside of the monorepo

   ```sh
   # start a project outside the monorepo we'll copy it in later
   cd /path/---------outside---------/theatre-monorepo
   # make a new setup folder
   mkdir new-setup .
   cd new-setup
   ```

1. Bootstrap your setup using npm, yarn, or other bootstrapping scripts (like
   `npx create-react-app`)

   ```sh
   npm init --yes
   ```

1. Make sure there is a `yarn.lock` or `package-lock.json` file in this
   directory. Otherwise, when we move it back into the monorepo, yarn will
   complain that this package is not listed in the monorepo as a workspace.

   ```sh
   touch yarn.lock
   ```

1. Copy the new directory back to the monorepo and `cd` into it

   ```sh
   cp -r ./path/---------outside---------/theatre-monorepo/new-setup /path/to/theatre/monorepo/build-tests/new-setup
   cd /path/to/theatre/monorepo/build-tests/new-setup
   ```

1. Let yarn/npm run an install

   ```sh
   yarn install
   ```

1. Install `@theatre/core` and `@theatre/studio`, and possibly `@theatre/r3f`
   from the local registry:

   ```sh
   npx yalc link @theatre/core @theatre/studio @theatre/r3f
   ```

1. Copy the source (`src/*`) of one of the other setups into `new-setup` so you
   don't have to start from scratch.

1. Make sure that you add a `yarn build` script to `new-setup/package.json`,
   because it
   [will be used](https://github.com/theatre-js/theatre/blob/db7dadc0c997316f2027736e2ecba0ea4acda2d4/scripts/build-tests/build-setups.mjs#L18)
   to build the setup in the CI.

1. Test your setup by running its dev server or doing a build

   ```sh
   yarn start
   ```

> **Gotchas**
> Some bundlers like webpack are not configured to work well with yarn workspaces by default. For example, the webpack config of create-react-app, tries to look up the node_modules chain to find missing dependencies, which is not a behavior that we want in build-tests setups. So if a setup doesn't work, try running it outside the monorepo to see if being in the monorepo is what's causing it to fail.

Feel free to check out [the existing setups](#the-currently-tested-setups) in
`ecosystem-tests` if you get stuck.
