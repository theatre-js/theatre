<h1 align="center">
  <img src="https://docs.theatrejs.com/public/theatrejs-logo-black.svg" alt="Theatre.js" width="200">
</h1>
<p align="center">Motion Design, for the web</p>
<p align="center">
 <a href="https://discord.gg/Tku4CJKf4B">
   <img src="https://img.shields.io/discord/870988717190426644?label=Discord" alt="Join us on Discord">
 </a> ⎯◈⎯
 <a href="https://twitter.com/theatre_js">
  <img src="https://img.shields.io/twitter/follow/theatre_js?style=social" alt="Follow us on Twitter">
 </a> ⎯◈⎯
 <a href="https://www.youtube.com/channel/UCsp9XOCs8v2twyq5kMLzS2Q">
  <img src="https://img.shields.io/youtube/channel/views/UCsp9XOCs8v2twyq5kMLzS2Q?label=TheatreJS&style=social" alt="Watch on YouTube">
 </a> ⎯◈⎯
 <a href="https://theatrejs.com">
  <img src="https://docs.theatrejs.com/public/theatrejs-logo-black.svg" alt="TheatreJS" width="70">.com
 </a>
</p>

> ✨ Update: [We're hiring – join the core team!](https://join.theatrejs.com/)

Theatre.js is an animation library for high-fidelity motion graphics. It is
designed to help you express detailed animation, enabling you to create
intricate movement, and convey nuance.

Theatre can be used both programmatically _and_ visually.

---

You can use Theatre.js to:

- Animate 3D objects made with THREE.js or other 3D libraries

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-3d-short.gif)

  <sub>Art by
  [drei.lu](https://sketchfab.com/models/91964c1ce1a34c3985b6257441efa500)</sub>

- Animate HTML/SVG via React or other libraries

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-dom.gif)

- Design micro-interactions

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-micro-interaction.gif)

- Choreograph generative interactive art

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-generative.gif)

- Or animate any other JS variable

  ![s](https://raw.githubusercontent.com/AriaMinaei/theatre-docs/main/docs/.vuepress/public/preview-console.gif)

## Documentation and Tutorials

The docs are at [docs.theatrejs.com](https://docs.theatrejs.com):

- [Getting started](https://docs.theatrejs.com/getting-started/)
- [In depth guide](https://docs.theatrejs.com/in-depth/)
- [API docs](https://docs.theatrejs.com/api/)
- [Extensions](https://docs.theatrejs.com/extensions/)
- [Video tutorials](https://www.youtube.com/channel/UCsp9XOCs8v2twyq5kMLzS2Q)
  - [Crash course](https://www.youtube.com/watch?v=icR9EIS1q34)
  - [Animating with music](https://www.youtube.com/watch?v=QoS4gMxwq_4)
  - [Yuri Artiukh](https://twitter.com/akella)'s
    [stream](https://youtu.be/qmRqgFbNprM?t=3462) with a section on using
    Theatre with THREE.js
  - \<Add your own tutorials here\>

## Community and support

Join our friendly community on [Discord](https://discord.gg/bm9f8F9Y9N), follow
the updates on [twitter](https://twitter.com/AriaMinaei) or write us an
[email](mailto:hello@theatrejs.com).

## Development and contributing

If you want to change the source of Theatre, have a look at the guide
[here](./CONTRIBUTING.md).

### Proposing fixes and changes

You can always get help with bugfixes or discuss changes with our community on
[Discord](https://discord.gg/bm9f8F9Y9N), or directly open an issue on Github.

### Helping with outstanding issues

Feel free to chime in on any
[issue](https://github.com/AriaMinaei/theatre/issues). We have also labeled some
issues with
["Help wanted"](https://github.com/AriaMinaei/theatre/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22)
or
["Good first issue"](https://github.com/AriaMinaei/theatre/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22)
if you're just getting started with the codebase.

### Helping with documentation

The documentation website's repo is
[here](https://github.com/ariaminaei/theatre-docs/).

### Writing/recording tutorials

If you make tutorials or video content about Theatre, tell us to showcase it
here :)

## License

Your use of Theatre.js is governed under the Apache License Version 2.0:

- Theatre's core (`@theatre/core`) is released under the Apache License. Same
  goes for most packages in this repository.
- The studio (`@theatre/studio`) is released under the AGPL 3.0 License. This is
  the package that you use to edit your animations, setup your scenes, etc. You
  only use the studio during design/development. Your project's final bundle
  only includes `@theatre/core`, so only the Apache License applies.
