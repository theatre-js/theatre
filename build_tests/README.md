# Build tests

Inspired by the
[#help channel on our Discord](https://discord.com/channels/870988717190426644/870988717190426647)
we collect examples for including `Theatre.js` in project that use different
tools (`parcel`, `Next.js`, `vanilla Rollup`, etc...). These example projects
are tested in the CI.

## The currently tested setups

| project                     | tools                      | `package.json`                      |
| --------------------------- | -------------------------- | ----------------------------------- |
| @build_tests/parcel         | `parcel 1.x`, `typescript` | [link](parcel/package.json)         |
| @build_tests/parcel_v2      | `parcel 2.x`               | [link](parcel_v2/package.json)      |
| @build_tests/vanilla_rollup | `rollup 2.x`               | [link](vanilla_rollup/package.json) |

## Testing the configurations locally

1. **Setup**

Run the following commands:

```sh
yarn build:ts
yarn workspace theatre build
yarn workspace @theatre/dataverse build
```

2. **Build the project** (`@build_tests/parcel_v2` in this case)

```sh
yarn workspace @build_tests/parcel_v2 build
```

## Adding a new setup

1.  Create a new directory in `theatre/build_tests/` with the new setup
2.  Add `@theatre/core` and `@theatre/studio` as dependencies to the
    `package.json` in the new project
    - Use `"workspace:*"` for the version specification:
      ```json
      ...
      "dependencies": {
         ...
         "@theatre/core": "workspace:*",
         ...
       },
       "devDependencies": {
         ...
         "@theatre/studio": "workspace:*",
         ...
       },
       ...
      ```
3.  Set `hoistingLimits` to `"dependencies"` in the `package.json`:
    ```json
    ...
    "name": "@build_tests/your-new-setup",
    "installConfig": {
      "hoistingLimits": "dependencies"
    },
    "dependencies": {
      ...
    },
    ...
    ```
4.  Use the
    [Hello world](https://docs.theatrejs.com/getting-started/install/#install-theatre)
    example from the docs for creating a `Theatre.js` project in it
5.  Run `yarn` in the root of the `theatre` repo to install the dependencies
    > You may have to delete yarn's cache (`rm -rf ./.yarn/cache`), and every
    > `node_modules` directory in the repo
    > (`find . -name 'node_modules' -not -path '*/node_modules/*' | xargs rm -rf`)

Feel free to check out the existing workspaces in `build_tests` if you get
stuck.
