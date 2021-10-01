# Theatre.js changelog

## 0.4.5

* New features
  * `sequence.attachAudio()` now uses an internal [`GainNode`](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) that you can customize by connecting it to your own audio graph. Docs [here](https://docs.theatrejs.com/in-depth/#sound-and-music).

## 0.4.4

* New features
  * Implemented [@theatre/browser-bundles](https://www.npmjs.com/package/@theatre/browser-bundles), a custom build of Theatre.js that can be used via a `<script>` tag and a CDN. This should enable Theatre.js to be used in CodePen or projects that don't use a bundler.

## 0.4.3

* New features
  * `sequence.attachAudio()` now [accepts](https://github.com/AriaMinaei/theatre/commit/3f0556b9eb66a0893b43e38a3ee889e13d3a6667) any `AudioNode` as destination.
  * Implemented `studio.createContentOfSaveFile()` for programmatically exporting the project's state.

## 0.4.2

* New features
  * `sequence.attachAudio` now handles autoplay blocking ([Docs](https://docs.theatrejs.com/in-depth/#sequence-attachaudio)).
  * `studio.selection` and co have a more [lax](https://github.com/AriaMinaei/theatre/commit/dcf90983a565e585661b631b457a807eb4a4d874) type constraint.
* Bug fixes
  * Fixed the builds of internal examples.

## 0.4.1

* Bug fixes
  * [Fixed](https://github.com/AriaMinaei/theatre/commit/fe4010c2c64626029a26e29b9ad9104df9c56ad4) the jumping issue with `sequence.play({range})`.
  * [Fixed](https://github.com/AriaMinaei/theatre/commit/769eefb5e521c8206152b0e23937d5a3cd872b8b) a typo in the `dependencies` field, thanks [Nikhil Saraf](https://github.com/nksaraf)!