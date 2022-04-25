# Build tests

Inspired by the
[#help channel on our Discord](https://discord.com/channels/870988717190426644/870988717190426647)
we collect examples for including `Theatre.js` in project that use different
tools (`parcel`, `Next.js`, `vanilla Rollup`, etc...) to build them in the CI
(these are the _build tests_).

## The currently tested setups

| project               | tools                      | `package.json`                 |
| --------------------- | -------------------------- | ------------------------------ |
| build_tests/parcel_v1 | `parcel 1.x`, `typescript` | [link](parcel/package.json)    |
| build_tests/parcel_v2 | `parcel 2.x`               | [link](parcel_v2/package.json) |
| build_tests/rollup    | `rollup 2.x`               | [link](rollup/package.json)    |

## Testing the configurations locally

1. **Build and publish the theatre packages to a local registry**

Run the following command in the root of the theatre monorepo:

```sh
npx zx scripts/publish-to-yalc.mjs
```

2. **Install the dependencies of the test project**

Navigate into the directory of the selected configuration (`parcel_v2` in this
case) and install the dependencies of the project:

```sh
cd build_tests/parcel_v2/
yarn
```

3. **Add the theatre packages to the project from the local registry**

```sh
npx yalc link @theatre/core
npx yalc link @theatre/studio
```

4. **Start the dev server**

```sh
yarn start
```

## Adding a new setup

1. Run the following command to publish the newest version of `@theatre/core`
   and `@theatre/studio` to the local registry managed with `yalc`:

   ```sh
   yarn yalc:publish
   ```

2. Create a new directory in `theatre/build_tests/` with the new setup
3. Do not add the `@theatre/core` and `@theatre/dataverse` packages to the
   config! The script will handle that.
4. Create an empty `yarn.lock` file in the new project's root folder, if it
   doesn't already exist:

   ```sh
   touch yarn.lock
   ```

5. Install the dependencies

   ```sh
   yarn
   ```

6. Install `@theatre/core` and `@theatre/studio` from the local registry:

   ```sh
   npx yalc link @theatre/core @theatre/studio
   ```

7. Use the
   [Hello world](https://docs.theatrejs.com/getting-started/install/#install-theatre)
   example from the docs for creating a `Theatre.js` project

8. Make sure that you add a `yarn build` script to the repo, because the it will
   be used to build the project in the CI.

9. Test your config by starting a dev server in the new project's root. In
   `parcel_v2`' you can do it with the following command:
   ```sh
   yarn start
   ```

Feel free to check out [the existing projects](#the-currently-tested-setups) in
`build_tests` if you get stuck.
