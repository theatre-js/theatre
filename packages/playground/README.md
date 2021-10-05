# The playground

The playground is the quickest way to hack on the internals of Theatre. It uses a simple ESBuild config that builds all the related packages in one go, so whether you're changing `@theatre/core` or `@theatre/dataverse`, you can see the results immediately.

## How to use

Simply run `yarn run serve` in this folder to start the dev server.

The first time you run `serve`, an `src/index.ts` file will be created. This file won't be comitted to the repo, so you're free to change it.

There are some shared playgrounds in `src/shared` which are committed to ther epo. You can make your own playgrounds in `src/personal` which will be `.gitignore`d.

