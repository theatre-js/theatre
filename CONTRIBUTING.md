# Contributing to Theatre.js

>`@todo` Write the contribution guide.

## Commit messages

Our commit message format is as follows:

```
[Tag]: Short description (fixes #1234)

Longer description here if necessary
```

The first line of the commit message (the summary) must have a specific format. This format is checked by our build tools.

The `[Tag]` is one of the following:

* `Fix` - for a bug fix.
* `Update` - either for a backwards-compatible enhancement or for a rule change that adds reported problems.
* `New` - implemented a new feature.
* `Breaking` - for a backwards-incompatible enhancement or feature.
* `Docs` - changes to documentation only.
* `Build` - changes to build process only.
* `Upgrade` - for a dependency upgrade.
* `Chore` - for refactoring, adding tests, etc. (anything that isn't user-facing).