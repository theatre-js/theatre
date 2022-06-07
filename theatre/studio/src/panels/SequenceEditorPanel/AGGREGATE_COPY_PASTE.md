## The keyframe copy/paste algorithm

```
copy algorithm: find the closest common acnestor for the tracks selected

- obj1.props.transform.position.x => simple
- obj1.props.transform.position.{x, z} => {x, z}
- obj1.props.transform.position.{x, z} + obj1.props.transform.rotation.z =>
  {position: {x, z}, rotation: {z}}

paste:

- simple => simple => 1-1
- simple => {x, y} => {x: simple, y: simple} (distribute to all)
- compound => simple => compound[0] (the first simple property of the comopund,
  recursively)
- compound => compound =>
  - if they match perfectly, then we know what to do
  - if they match partially, then we paste partially
    - {x, y, z} => {x, z} => {x, z}
    - {x, y} => {x, d} => {x}
  - if they don't match at all
    - {x, y} => {a, b} => nothing
    - {x, y} => {transforms: {position: {x, y, z}}} => nothing
    - {x, y} => {object(not a prop): {x, y}} => {x, y}
      - What this means is that, in case of objects and sheets, we do a forEach
        at each object, then try pasting onto its object.props
```