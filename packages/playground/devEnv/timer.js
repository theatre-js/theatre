/** @param {string} name */
function timer(name) {
  const startMs = Date.now()
  console.group(`▶️ ${name}`)
  let stopped = false
  return {
    /**
     * @type {<T> (fn: () => T): T}
     */
    wrap(fn) {
      const result = fn()
      this.stop()
      return result
    },
    stop() {
      if (stopped) return
      stopped = true
      console.groupEnd()
      console.log(
        `✓ ${name} in ${((Date.now() - startMs) * 0.001).toFixed(3)}s`,
      )
    },
  }
}
exports.timer = timer
