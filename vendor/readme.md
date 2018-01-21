This directory is for those pieces of third-party code that we cannot install as an npm package, AND are too big to just include them in a descendent of `$src/`. Also, let's try to avoid as much as possible, submodules. They're a pain to work with, and npm/yarn don't handle them very well.

## Importnat note:

We need to keep track of what version of each third-party code we're using. So, for each folder directly under `vendors/`, create a `sourceInfo.json` file to keep track of where the code is coming from, and which version of the code we have checked out:

```
{
  "source": "https://github.com/facebook/react-devtools/tree/master/backend",
  "commmit":
    "https://github.com/facebook/react-devtools/commit/f8657bc1d2c791d7491861c5720418acbf1fa89a"
}

```