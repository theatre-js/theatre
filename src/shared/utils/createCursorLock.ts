import * as css from '$shared/components/CursorLock.css'

export default function createCursorLock(cursor: string) {
  const el = document.createElement('div')
  el.classList.add(css.container)
  el.style.cursor = cursor
  document.body.appendChild(el)
  const relinquish = () => {
    document.body.removeChild(el)
  }

  return relinquish
}
