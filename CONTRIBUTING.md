# Contributing to Theatre.js

## Development workflow

### Setting up the environment

Make sure you have [`node 14+`](https://nodejs.org/) installed:
```sh
$ node -v
> v14.0.0
```

and [`yarn 1.22+`](https://classic.yarnpkg.com/en/):

```sh
$ yarn -v
> 1.22.10
```

Then clone the repo:

```sh
$ git clone git@github.com:AriaMinaei/theatre.git
$ cd theatre
```

And fetch the dependencies with yarn:

```sh
$ yarn
```

* Notes about Yarn:
  * This project uses [yarn workspaces](https://yarnpkg.com/features/workspaces) so `npm install` will not work.
  * This repo uses Yarn v2. You don't have to install yarn v2 globally. If you do have yarn 1.22.10+ on your machine, yarn will automatically switch to v2 when you `cd` into theatre. Read more about Yarn v2 [here](https://yarnpkg.com/).

### Hacking with `playground`

The quickest way to start tweaking things is to run the `playground` package.

```sh
$ cd ./packages/playground
$ yarn serve
```

The playground is a bunch of ready-made projects that you can run to experiment with Theatre.js.

It uses a single ESBuild config to build all of the related packages in one go, so you don't have to run a bunch of build commands separately.

Read more at [`./packages/playground/README.md`](./packages/playground/README.md).

### Hacking with `examples/`

Other than `playground`, the [`examples/`](./examples) folder contains a few small projects that use Theatre with [parcel](https://parceljs.org), [Create react app](create-react-app.dev), and other build tools. This means that unlike `playground`, you have to build all the packages before running the examples.

You can do that by running the `build` command at the root of the repo:

```sh
$ yarn build
```

Then build any of the examples:
```
$ cd examples/dom-cra
$ yarn start
```

### Running tests

We use a single [jest](https://jestjs.io/) setup for the repo. The tests files have the `.test.ts` or `.test.tsx` extension.

You can run the tests at the root of the repo:

```sh
$ yarn test

# or run them in watch mode:
$ yarn test --watch
```

### Type checking

The packages in this repo have full typescript coverage, so you should be able to get diagnostics and intellisense if your editor supports typescript.

You can also run a typecheck of the whole repo from the root:

```sh
$ yarn typecheck

# or in watch mode:
$ yarn typecheck --watch
```

* If you're using VSCode, we have a ["Typescript watch"](./.vscode/tasks.json) task for VSCode that you can use by [running](https://code.visualstudio.com/Docs/editor/tasks) "Run Task -> Typescript watch".
* If you wish to contribute code without typescript annotations, that's totally fine. We're happy to add the annotations to your PR.

### Linting

We're using a minimal [ESLint](https://code.visualstudio.com/Docs/editor/tasks) setup for linting. If your editor supports ESLint, you should get diagnostics as you code. You can also run the lint command from the root of the repo:

```sh
$ yarn lint:all
```

Some lint rules have [autofix](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems), so you can run:

```sh
$ yarn lint:all --fix
```

### Publishing to npm

Currently all packages (except for [`@theatre/r3f`](./packages/r3f/)) share the same version number. In order to publish to npm, you can run the `release` script from the root of the repo:

```sh
$ yarn release x.y.z # npm publish version x.y.z
$ yarn release x.y.z-dev.w # npm publish version x.y.z-dev.w and tag it as "dev"
$ yarn release x.y.z-rc.w # npm publish version x.y.z-rc.w and tag it as "rc"
```

### Generating API docs

We use [API extractor](https://api-extractor.com/pages/setup/generating_docs/) to generate API docs in markdown. We put the markdown files in the [theatre-docs](https://github.com/ariaminaei/theatre-docs/) repo, which also contains the tutorials and guides.

To generate the API docs, run the `build:api-docs` from the root of the repo:

```sh
$ yarn build:api-docs /path/to/theatre-docs/docs/api/ # this will empty the /api folder and regenerate the markdown files
```

Learn more about api documentation [here](./contributing/api-docs.md).

## Project structure

The [monorepo](https://en.wikipedia.org/wiki/Monorepo) consists of:

* `@theatre/core` – The core animation library at [`./theatre/core`](./theatre/core).
* `@theatre/studio` – The visual editor at [`./theatre/studio`](./theatre/studio).
* `@theatre/dataverse` – The reactive dataflow library at [`./packages/dataverse`](./packages/dataverse).
* `@theatre/react` – Utilities for using Theatre with React at [`./packages/react`](./packages/react).
* `@theatre/r3f` – The react-three-fiber extension at [`./packages/r3f`](./packages/r3f).
* `playground` – The playground explained [above](#hacking-with-playground), located at [`./packages/playground`](./packages/playground)
* `examples/` * A bunch of [examples](#hacking-with-examples) at [./examples](./examples).

In addition, each package may contain a `dotEnv/` folder that holds some dev-related files, like bundle configuration, lint setup, etc.

## Commands

These commands are available at the root workspace:

```sh
# Run the playground. It's a shortcut for `cd ./playground; yarn run serve`
$ yarn playground

# Run all the tests.
$ yarn test

# Run tests in watch mode.
$ yarn test --watch

# Typecheck all the packages
$ yarn typecheck

# Typecheck all the packages in watch mode
$ yarn typecheck --watch

# Run eslint on the repo
$ yarn lint:all

# Run eslint and auto fix
$ yarn lint:all --fix

# Build all the packages
$ yarn build

# Build the api documentation
$ yarn build:api-docs /path/to/theatre-docs/docs/api/
```

> Yarn passes all extra parameters to the internal scripts. So, for example, if you wish to run the tests in watch mode, you can run `yarn test --watch`.

## Documentation

The libraries come bundled with typescript definitions with TSDoc comments. You can explore the API if your editor is configured to display TSDoc comments.

Other references

- [Documentation: https://docs.theatrejs.com](https://docs.theatrejs.com/getting-started/)
- [API docs: https://docs.theatrejs.com/api/](https://docs.theatrejs.com/api/)
- [Video: Theatre.js Crash Course](https://www.youtube.com/watch?v=icR9EIS1q34)

## What to contribute

You can contribute with:

* Bug fixes
* Feature suggestions 
* Features implementations
* [Documentation](https://github.com/ariaminaei/theatre-docs/) (or write/record tutorials of your own which we'll showcase)
* Create examples projects for your own particular dev stack (eg. using Pixie/Vue/THREE.js/Babylon/etc)

Another great way to help is to join our [community](https://discord.gg/bm9f8F9Y9N) and chime in on questions and share ideas.

### Helping with outstanding issues

Feel free to chime in on any [issue](https://github.com/AriaMinaei/theatre/issues). We have labeled some with ["Help wanted"](https://github.com/AriaMinaei/theatre/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22) or ["Good first issue"](https://github.com/AriaMinaei/theatre/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22) if you're just getting started with the codebase.

## Sending pull requests

We use Github's regular PR workflow. Basically fork the repo, push your commits, and send a pull request.

If you're a core contributor and have write access to the repo, you should submit your pull requests from a branch
rather than a personal fork. The naming convention for these branches should be:

* `(feature|hotfix)/[identifier]`