// @flow

const stack = []

export default {
  gool(cb) {
    const foundDeps = new Set()
    stack.push(foundDeps)
    cb()
    stack.pop()
    return foundDeps
  },
  addObservedDepToCurrentStackTop(d) {
    if (stack.length === 0) return
    stack[stack.length - 1].add(d)
  },
}