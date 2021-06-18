export function createCursorLock(cursor: string) {
  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999999;`

  el.style.cursor = cursor
  document.body.appendChild(el)
  const relinquish = () => {
    document.body.removeChild(el)
  }

  return relinquish
}
