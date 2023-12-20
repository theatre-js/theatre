export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(() => {
        return true
      })
      .catch(() => {
        return false
      })
  } else {
    const tempTextArea = document.createElement('textarea')
    tempTextArea.value = text
    document.body.appendChild(tempTextArea)
    tempTextArea.focus()
    tempTextArea.select()
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(tempTextArea)
      return Promise.resolve(successful)
    } catch (err) {
      document.body.removeChild(tempTextArea)
      return Promise.resolve(false)
    }
  }
}
