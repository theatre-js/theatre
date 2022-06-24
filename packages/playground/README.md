# The playground

The playground is the quickest way to hack on the internals of Theatre. It also hosts our end-to-end tests. It uses a build setup that builds all the related packages in one go, so you _don't_ have to run a bunch of build commands separately to start developing.

## Directory structure

```
src/
  shared/                      <---- playgrounds shared with teammates.
    [playground-name]/         <---- each playground has a name...
      index.tsx                <---- and an entry file.

  personal/                    <---- personal playgrounds (gitignored).
    [playground-name]/         <---- personal playgrounds also have names,
      index.tsx                <---- and an entry file.

  tests/                       <---- playgrounds for e2e testing.
    [playground-name]/         <---- the name of the test playground,
      index.tsx                <---- and its entry file.
      [test-file-name].e2e.ts  <---- The playwright test script that tests this particular playground.
      [test2].e2e.ts           <---- We can have more than one test file per playground.
```

## How to use the playground

Simply run `yarn run serve` in this folder to start the dev server.

There are some shared playgrounds in `src/shared` which are committed to the repo. You can make your own playgrounds in `src/personal` which will be `.gitignore`d. Note that every playground must include an entry file called `index.tsx` (as you see in the [Directory structure section](#directory-structure)).

## How to write and run end-to-end tests

The end-to-end tests are in the `src/tests` folder. Look at [directory structure](#directory-structure) to see how test files are organized.

The end-to-end tests are made using [playwright](https://playwright.dev). You should refer to playwright's documentation 

```bash
$ cd playground
$ yarn test # runs the end-to-end tests
$ yarn test --project=firefox # only run the tests in firefox
$ yarn test --project=firefox --headed # run the test in headed mode in firefox
$ yarn test --debug # run in debug mode using the inspector: https://playwright.dev/docs/inspector
```

### Using playwright codegen

To use [playwright's codegen tool](https://playwright.dev/docs/codegen), first serve the playground and then run the codegen on the a url that points to the playground you wish to test:

```bash
$ cd playground
$ yarn serve # first serve the playground
$ yarn playwright codegen http://localhost:8080/tests/[playground-name] # run the codegen for [playground-name]
```

## Visual regression testing

We're currently using [percy](https://percy.io) for visual regression testing. These tests run only the the [CI](../../.github/workflows/main.yml) using [Github actions](https://github.com/theatre-js/theatre/actions). Look at the example at [`src/tests/setting-static-props/test.e2e.ts`](src/tests/setting-static-props/test.e2e.ts) for an example of recording and diffing a screenshot.

Please note that we haven't figured out the best practices for visual regression testing yet, so if the setup isn't optimal, please let us know.
