# Theatre.js browser bundles

A custom build of Theatre.js that you can use via a `<script>` tag rather than using a bundler.

## How to use

There are currently two builds:

* `dist/core-and-studio.js`
* `dist/core-only.min.js`

As the names imply, one includes both `@theatre/studio` and `@theatre/core`, while the other is a minified version of `@theatre/core`.

Example:

```html
<script src="path/to/core-and-studio.js"></script>
<script>
  // here, core is equal to `import * as core from '@theatre/core`
  const core = Theatre.core
  // here, studio is equal to `import studio from '@theatre/studio`.
  // Note this would be undefined if you're using `core-only.min.js`
  const studio = Theatre.studio

  // only call this if you're using the core-and-studio.js bundle
  studio.initialize()

  const project = core.getProject("My project")
  const sheet = project.sheet("...")
  // and so on...
</script>
```