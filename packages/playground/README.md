# The playground

The playground is the quickest way to hack on the internals of Theatre. It also
hosts our end-to-end tests. It uses a build setup (see the live-reload esbuild
server in [./devEnv/build.ts](./devEnv/build.ts)) that builds all the related
packages in one go, so you _don't_ have to run a bunch of build commands
separately to start developing.

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

There are some shared playgrounds in `src/shared` which are committed to the
repo. You can make your own playgrounds in `src/personal` which will be
`.gitignore`d. Note that every playground must include an entry file called
`index.tsx` (as you see in the
[Directory structure section](#directory-structure)).

## How to write and run end-to-end tests

The end-to-end tests are in the `src/tests` folder. Look at
[directory structure](#directory-structure) to see how test files are organized.

The end-to-end tests are made using [playwright](https://playwright.dev). You
should refer to playwright's documentation

```bash
$ cd playground
$ yarn test # runs the end-to-end tests
$ yarn test --project=firefox # only run the tests in firefox
$ yarn test --project=firefox --headed # run the test in headed mode in firefox
$ yarn test --debug # run in debug mode using the inspector: https://playwright.dev/docs/inspector
```

### Using playwright codegen

To use [playwright's codegen tool](https://playwright.dev/docs/codegen), first
serve the playground and then run the codegen on the a url that points to the
playground you wish to test:

```bash
$ cd playground
$ yarn serve # first serve the playground
$ yarn playwright codegen http://localhost:8080/tests/[playground-name] # run the codegen for [playground-name]
```

## Visual regression testing

Some `.e2e.ts` files also contain visual regression tetst. These tests run only
the the [CI](../../.github/workflows/main.yml) using
[Github actions](https://github.com/theatre-js/theatre/actions). Look at the
example at
[`src/tests/setting-static-props/test.e2e.ts`](src/tests/setting-static-props/test.e2e.ts)
for an example of recording and diffing a screenshot.

Note that CI runs the visual regression tests in a linux VM, which is bound to
produce a slightly different screenshot than a browser on Mac/Windows. Because
of that, we have a `docker-compose.yml` file at the root of the repo which you
can use to produce a screenshot in a linux vm. Here is how you can use it:

```bash
$ cd repo
$ docker-compose up -d # start the linux vm
$ docker-compose exec -it node bash # ssh into the vm
$ cd app
$ yarn
$ yarn test:e2e:ci
```

If you're submitting a PR that breaks the visual regression tests and you're not
familiar with Docker, simply ask the mainainers to update the screenshots for
you.
