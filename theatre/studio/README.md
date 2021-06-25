# Theatre.js

Theatre.js is a motion-graphics toolkit for the web. It comes with an animation library, and a visual editor.

Theatre works with all rendering stacks. You can use it to animate DOM elements, THREE.js objects, or any kind of JavaScript variable.

## Docs

Docs are [on github](https://github.com/AriaMinaei/theatre).

## `@theatre/studio`

Theatre comes in two packages: `@theatre/core` (the library) and `@theatre/studio` (the editor). This package is the editor, which is only used during design/development.

## License

Your use of Theatre.js is governed under the Apache License Version 2.0:

* Theatre's core (`@theatre/core`) is released under the Apache License.
* The studio (`@theatre/studio`) is released under the AGPL 3.0 License. This is the package that you use to edit your animations, setup your scenes, etc. You only use the studio during design/development. Your project's final bundle only includes `@theatre/core`, so only the Apache License applies.