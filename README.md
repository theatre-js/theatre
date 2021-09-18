# Theatre.js

Theatre.js is an animation library for high-fidelity motion graphics. It is designed to help you express detailed animation, enabling you to create intricate movement, and convey nuance.

Theatre can be used both programmatically _and_ visually.

You can use Theatre.js to:

* Animate 3D objects made with THREE.js or other 3D libraries
  
  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-3d-short.gif)

* Animate HTML/SVG via React or other libraries

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-dom.gif)

* Design micro-interactions

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-micro-interaction.gif)

* Choreograph generative interactive art

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-generative.gif)

  

* Or animate any other JS variable

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-console.gif)

## Documentation and Tutorials

You can find the documentation and video tutorials [here](https://docs.theatrejs.com).

## Community

Join us on [Discord](https://discord.gg/bm9f8F9Y9N) or write us an [email](mailto:hello@theatrejs.com).

## License

Your use of Theatre.js is governed under the Apache License Version 2.0:

* Theatre's core (`@theatre/core`) is released under the Apache License. Same goes for most packages in this repository.
* The studio (`@theatre/studio`) is released under the AGPL 3.0 License. This is the package that you use to edit your animations, setup your scenes, etc. You only use the studio during design/development. Your project's final bundle only includes `@theatre/core`, so only the Apache License applies.