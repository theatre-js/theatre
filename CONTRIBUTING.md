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

It uses a single ESBuild config to build all of the related packages in one go, so you don't have to run a bunch of build commands.

Read more at [`./packages/playground/README.md`](./packages/playground/README.md).

## Project structure

* `@theatre/core` – The core animation library.
  * Location: [`./theatre/core`](./theatre/core)
* `@theatre/studio` – The visual editor.
  * Location: [`./theatre/studio`](./theatre/studio)
* `@theatre/dataverse` – The reactive dataflow library.
  * Location: [`./packagtes/dataverse`](./packages/dataverse)
* `@theatre/react` – Utilities for using Theatre with React.
  * Location: [`./packagtes/react`](./packages/react)
* `@theatre/r3f` – The react-three-fiber extension.
  * Location: [`./packagtes/r3f`](./packages/r3f)
* `playground` – The quickest way to hack on the internals of Theatre. It bundles all the related packages together with one ESBuild setup.
  * Location: [`./packagtes/playground`](./packages/playground)
* `examples/`
  * A bunch of examples, using Theatre with [parcel](https://parceljs.org) or [Create react app](create-react-app.dev).


### Commands

#### Root commands

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

> Yarn passes all extra parameters to the internal scripts. So, for example, if you wish to run the tests in watch more, you can run `yarn test --watch`.

## Workflow

> This section is lacking in instructions (PRs welcome!).

1. Find (or create) an issue you would like to look at
2. Implement the changes & test it against
3. Run the tests to ensure that nothing has been broken
4. Create a PR & reference the issue 🎉

If you have any questions or issues along the way, drop a message in the
[discord community](https://discord.gg/bm9f8F9Y9N) and maybe someone can help!

## Documentation

> This section is lacking in instructions (PRs welcome!).

The libraries come bundled with typescript definitions with TSDoc comments. You can explore the API if your editor is configured to display TSDoc comments.

Other references

- [Documentation: https://docs.theatrejs.com](https://docs.theatrejs.com/getting-started/)
- [Video: Theatre.js Crash Course](https://www.youtube.com/watch?v=icR9EIS1q34)

## Testing

Run tests during development with `yarn test --watch` to re-run tests on file changes.

### Examples

> This section is lacking in instructions (PRs welcome!).

## Releasing

> This section is lacking in instructions (PRs welcome!).
