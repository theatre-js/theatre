import {useState} from 'react'
import useKeyDownCallback from './useKeyDownCallback'

export default function useKeyDown(
  combo: Parameters<typeof useKeyDownCallback>[0],
): boolean {
  const [state, setState] = useState(false)
  useKeyDownCallback(combo, ({down}) => {
    setState(down)
  })
  return state
}
