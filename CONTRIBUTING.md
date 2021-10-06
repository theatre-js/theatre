# Contributing to Theatre.js

## The quick version

Have `node 14+` and `yarn 1.22+` installed. Then `git clone` and `yarn install`. Then `cd packages/playground` and `yarn run serve`. Happy hacking!

## The long version

### Prerequisites

Make sure you have [Node](https://nodejs.org/) installed at v14.0.0+

```sh
$ node -v
> v14.0.0
```

and [Yarn](https://classic.yarnpkg.com/en/) at v1.22.10+.

```sh
$ yarn -v
> 1.22.10
```

> **Note about Yarn v2**: This repo uses Yarn v2. You don't have to install yarn v2 globally. If you do have yarn 1.22.10+ installed, and `cd` into `/path/to/theatre`, yarn will automatically switch to v2. Read more about Yarn v2 [here](https://yarnpkg.com/).

### Fork, Clone & Install

Start by forking Theatre.js to your GitHub account. Then clone your fork and install dependencies:

```sh
$ git clone git@github.com:<your-user>/theatre.git
$ cd theatre
$ yarn
```

> ⚠ theatre relies on
> [yarn workspaces](https://yarnpkg.com/features/workspaces) so
> `npm install` will not work in this repository.

Add our repo as a git remote so you can pull/rebase your fork with our latest
updates:

```sh
$ git remote add upstream git@github.com:AriaMinaei/theatre.git
```

## Start hacking with `playground`

The quickest way to start tweaking things is to run the `playground` package.

```sh
$ cd ./packages/playground
$ yarn serve
```

The playground is a bunch of ready-made projects that you can run to experiment with Theatre.js.

It uses a single ESBuild config to build all of the related packages in one go, so you don't have to run a bunch of build commands separately.

Read more at [`./packages/playground/README.md`](./packages/playground/README.md).

## Project structure

* `@theatre/core` – The core animation library.
  * Location: [`./theatre/core`](./theatre/core)
* `@theatre/studio` – The visual editor.
  * Location: [`./theatre/studio`](./theatre/studio)
* `@theatre/dataverse` – The reactive dataflow library.
  * Location: [`./packages/dataverse`](./packages/dataverse)
* `@theatre/react` – Utilities for using Theatre with React.
  * Location: [`./packages/react`](./packages/react)
* `@theatre/r3f` – The react-three-fiber extension.
  * Location: [`./packages/r3f`](./packages/r3f)
* `playground` – The quickest way to hack on the internals of Theatre. It bundles all the related packages together with one ESBuild setup.
  * Location: [`./packages/playground`](./packages/playground)
* `examples/` * A bunch of examples, using Theatre with [parcel](https://parceljs.org), [Create react app](create-react-app.dev), etc.
* `*/devEnv`: Each package may have a `devEnv` folder that holds dev-related files, like bundler configuration, lint config, etc.


### Commands

#### Root commands

These commands are available at the root workspace:

```sh
# Run the playground. It's a shortcut for `cd ./playground; yarn run serve`
yarn playground

# Run all the tests.
yarn test

# Run tests in watch mode.
yarn test --watch

# Typecheck all the packages
yarn typecheck

# Run eslint on the repo
yarn lint:all

# Run eslint and auto fix
yarn lint:all --fix
```

> Yarn passes all extra parameters to the internal scripts. So, for example, if you wish to run the tests in watch mode, you can run `yarn test --watch`.

## Documentation

The libraries come bundled with typescript definitions with TSDoc comments. You can explore the API if your editor is configured to display TSDoc comments.

Other references

- [Documentation: https://docs.theatrejs.com](https://docs.theatrejs.com/getting-started/)
- [Video: Theatre.js Crash Course](https://www.youtube.com/watch?v=icR9EIS1q34)

## Testing

Run tests during development with `yarn test --watch` to re-run tests on file changes.

### Examples

Other than `playground`, the [`examples/`](./examples) folder contains a few small projects using the bundled version of the library. This means that unlike `playground`, you have to build all the packages before running the examples.

## Releasing

Currently all packages (except for [`@theatre/r3f`](./packages/r3f/)) share the same version number. In order to publish to npm, you can run the `release` script from the root of the repo:

```sh
$ yarn release x.y.z # npm publish version x.y.z
$ yarn release x.y.z-dev.w # npm publish version x.y.z-dev.w and tag it as "dev"
$ yarn release x.y.z-rc.w # npm publish version x.y.z-rc.w and tag it as "rc"
```