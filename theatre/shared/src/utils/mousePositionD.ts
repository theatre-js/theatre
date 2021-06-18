import {prism} from '@theatre/dataverse'

const mousePositionD = prism(() => {
  const [pos, setPos] = prism.state('pos', {clientX: 0, clientY: 0})
  prism.effect(
    'setupListeners',
    () => {
      const handleMouseMove = (e: MouseEvent) => {
        setPos({clientX: e.clientX, clientY: e.clientY})
      }
      document.addEventListener('mousemove', handleMouseMove)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    },
    [],
  )

  return pos
})

export default mousePositionD
