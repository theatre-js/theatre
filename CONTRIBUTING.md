# Contributing to Theatre.js

## Getting Started

### Prerequisites

Make sure you have [Node](https://nodejs.org/) installed at v14.0.0+

```sh
node -v

v14.0.0

```

and [Yarn](https://classic.yarnpkg.com/en/) at v2.0.0+.

```sh
yarn -v

2.0.0
```

### Fork, Clone & Install

Start by forking Theatre.js to your GitHub account. Then clone your fork and
install dependencies:

```sh
git clone git@github.com:<your-user>/theatre.git
cd theatre
yarn
```

> ⚠ theatre relies on
> [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) so
> `npm install` will not work in this repository.

Add our repo as a git remote so you can pull/rebase your fork with our latest
updates:

```
git remote add upstream git@github.com:AriaMinaei/theatre.git
```

## Project structure

> This section is lacking in instructions (PRs welcome!).

### `@theatre/core`

The core animation library. This project is located under
[`./theatre/core`](`/theatre/core).

### `@theatre/studio`

The visual editor. This project is located under
[`./theatre/studio`](`/theatre/studio).

### Commands

> This list is not updated, you should run `yarn run` to see all scripts.

#### Root commands

```sh
yarn playground            // run the playground

yarn test                  // run all tests
yarn typecheck             // TS typechecking
```

#### Theatre workspace commands

Commands available for the `@theatre` workspace:

```sh
yarn build:js
yarn build:js:watch
```

## Devflow

> This section is lacking in instructions (PRs welcome!).

When working on changes for the `@theatre` workspace, you want to have a couple
of things running concurrently:

1. Run the playground to verify the changes
   ```
   yarn playground
   ```
2. Watch and rebuild theatre packages on changes:
   ```sh
   cd theatre
   yarn build:js
   ```

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

The libraries come bundled with typescript definitions with TSDoc (opens new
window)comments. You can explore the API if your editor is configured to display
TSDoc comments.

Other references

- [Documentation: https://docs.theatrejs.com](https://docs.theatrejs.com/getting-started/)
- [Video: Theatre.js Crash Course](https://www.youtube.com/watch?v=icR9EIS1q34)

## Testing

Run tests during development with `yarn test` to re-run tests on file changes.

### Examples

> This section is lacking in instructions (PRs welcome!).

## Releasing

> This section is lacking in instructions (PRs welcome!).
