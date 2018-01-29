export const fitInput = input => {
  const min = 0
  const max = 300
  const pad_right = 1
  if (!input) return
  
  input.style.width = min + 'px'

  const tmp = document.createElement('div')
  if (getComputedStyle)
    tmp.style.cssText = getComputedStyle(input, null).cssText
  if (input.currentStyle) tmp.style.cssText = input.currentStyle.cssText
  tmp.style.width = ''
  tmp.style.padding = '0'
  tmp.style.position = 'absolute'
  tmp.style.left = '-55555px'
  tmp.innerHTML = input.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/ /g, '&nbsp;')
  input.parentNode.appendChild(tmp)
  const width = tmp.clientWidth + pad_right
  // @ts-ignore
  tmp.parentNode.removeChild(tmp)
  if (min <= width && width <= max) input.style.width = width + 'px'
}
