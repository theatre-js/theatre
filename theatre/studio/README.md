# Theatre.js

Theatre.js is an animation library for high-fidelity motion graphics. It is
designed to help you express detailed animation, enabling you to create
intricate movement, and convey nuance.

Theatre can be used both programmatically _and_ visually:

![Video showing a browser window containing three divs falling from the middle of the screen, and bouncing back up, animated with the help of Theatre.js](https://docs.theatrejs.com/public/preview-1.gif)

Theatre works with all rendering stacks. You can use it to animate DOM elements,
THREE.js objects, or any kind of JavaScript variable.

## Guide

Read the guide at [docs.theatrejs.com](https://docs.theatrejs.com)

## License

Theatre.js is released under the LGPL-v2.1 License and is free to use in
personal _and_ commercial projects. Some of the sub-libraries can also be used
independently under the Apache License 2.0 license.

### Bundling with Webpack, Rollup, parcel, etc.

You do not need to configure your build system to be in compliance with the LGPL
license. Theatre.js is already built in a way that all use of it with any build
system is already compliant with the license terms. See
`theatre/studio/src/entries/studio.ts` to learn how this is implemented.
