# The playground

The playground is the quickest way to hack on the internals of Theatre. It uses a simple ESBuild config that builds all the related packages in one go, so you _don't_ have to run a bunch of build commands separately to start developing.

## How to use

Simply run `yarn run serve` in this folder to start the dev server.

The first time you run `serve`, an `src/index.ts` file will be created. This file is the entry point, and it won't be comitted to the repo, so you're free to change it.

There are some shared playgrounds in `src/shared` which are committed to the repo. You can make your own playgrounds in `src/personal` which will be `.gitignore`d.

