---
title: Getting Started
---

# Getting started


## Install Theatre

Add `@theatre/core` as a dependency via npm or yarn.

```bash
$ npm install --save @theatre/core
```

Then add `@theatre/studio` as a dev dependency since we only need it during development.

```bash
$ npm install --save-dev @theatre/studio
```

## Import Theatre

```javascript
// import both core and studio (we can remove studio from the production bundle later)
import {getProject} from '@theatre/core'
import studio from '@theatre/studio'

// initialize the studio so the editing tools will show up on the screen
studio.initialize()

// create our first project
const myProject = getProject('My first project')
```

## Next steps

