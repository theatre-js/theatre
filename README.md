# Theatre.js

Theatre.js is an animation library for high-fidelity motion graphics. It is designed to help you express detailed animation, enabling you to create intricate movement, and convey nuance.

Theatre can be used both programmatically _and_ visually.

Theatre works with all rendering stacks. You can use it to animate DOM elements, THREE.js objects, or any kind of JavaScript variable.

## Documentation and Tutorials

You can find the documentation and video tutorials [here](https://docs.theatrejs.com).

## License

Your use of Theatre.js is governed under the Apache License Version 2.0:

* Theatre's core (`@theatre/core`) is released under the Apache License. Same goes for most packages in this repository.
* The studio (`@theatre/studio`) is released under the AGPL 3.0 License. This is the package that you use to edit your animations, setup your scenes, etc. You only use the studio during design/development. Your project's final bundle only includes `@theatre/core`, so only the Apache License applies.