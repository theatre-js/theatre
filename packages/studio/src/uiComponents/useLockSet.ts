import {useMemo, useState} from 'react'

type Unlock = () => void

type AddLock = () => Unlock

export default function useLockSet(): [isLocked: boolean, addLock: AddLock] {
  const [isLocked, _setIsLocked] = useState(false)
  const addLock = useMemo(() => {
    const locks = new Set()
    return () => {
      const unlock = () => {
        locks.delete(unlock)
        _setIsLocked(locks.size > 0)
      }
      locks.add(unlock)
      _setIsLocked(true)
      return unlock
    }
  }, [])
  return [isLocked, addLock]
}
