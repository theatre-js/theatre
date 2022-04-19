# Build tests

Inspired by the
[#help channel on our Discord](https://discord.com/channels/870988717190426644/870988717190426647)
we collect examples for including `Theatre.js` in project that use different
tools (`parcel`, `Next.js`, `vanilla Rollup`, etc...). These example projects
are tested in the CI.

## The currently tested setups

| project                    | tools                      | `package.json`                      |
| -------------------------- | -------------------------- | ----------------------------------- |
| build_tests/parcel_v1      | `parcel 1.x`, `typescript` | [link](parcel/package.json)         |
| build_tests/parcel_v2      | `parcel 2.x`               | [link](parcel_v2/package.json)      |
| build_tests/vanilla_rollup | `rollup 2.x`               | [link](vanilla_rollup/package.json) |

## Testing the configurations locally

1. **Setup**

Run the following command in the root of the theatre monorepo:

```sh
yarn build
```

2. **Start the dev server**

Navigate into the directory of the selected configuration (`parcel_v2` in this
case) and start the dev server:

```sh
cd build_tests/parcel_v2/
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

5. Add `yalc` to the new project's dependencies:
   ```sh
   yarn install yalc
   ```
6. Install the dependencies

   ```sh
   yarn
   ```

7. Install `@theatre/core` and `@theatre/studio` from the local registry:

   ```sh
   npx yalc add @theatre/core @theatre/studio
   ```

8. Install the dependencies again:

   ```sh
   yarn
   ```

9. Use the
   [Hello world](https://docs.theatrejs.com/getting-started/install/#install-theatre)
   example from the docs for creating a `Theatre.js` project in it

10. Test your config by starting a dev server in the new project's root. In `parcel_v2`;s case it'll be:
    ```sh
    yarn start
    ```

Feel free to check out the existing workspaces in `build_tests` if you get
stuck.
