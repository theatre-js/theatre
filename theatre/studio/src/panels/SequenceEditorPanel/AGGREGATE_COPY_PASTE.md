## The keyframe copy/paste algorithm

The copy and paste algorithms are specified below. Note that the copy algorithm
is written with some capital letters to emphasize organization, its not an
actual language or anything. The copy algorithm changed recently and the
examples are more up-to-date than the paste algorithm because pasting stayed the
same.

```
ALGORITHM copy:

LET PATH =
  CASE copy selection / single track THEN the path relative to the closest common ancestor for the tracks selected
  CASE copy aggregate track          THEN the path relative the aggregate track compoundProp/sheetObject/sheet

FOR EXAMPLE CASE copy selection / single track:
- obj1.props.transform.position.x => x
- obj1.props.transform.position.{x, z} => {x, z}
- obj1.props.transform.position.{x, z} + obj1.props.transform.rotation.z =>
  {position: {x, z}, rotation: {z}}

FOR EXAMPLE CASE copy aggregate track:
- sheet.obj1.props.transform.position => {x, y, z}
- sheet.obj1.props.transform => {position: {x, y, z}, rotation: {x, y, z}}
- sheet => { obj1: { props: { transform: {position: {x, y, z}, rotation: {x, y, z}}}}}

ALGORITHM: paste:

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
