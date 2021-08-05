import type {$IntentionalAny} from '@theatre/shared/utils/types'
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'

// using an ID to make CSS selectors faster
const elementId = 'pointer-root'

const Container = styled.div`
  pointer-events: auto;
  &.normal {
    pointer-events: none;
  }
`

const CursorOverride = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  #pointer-root:not(.normal) > & {
    pointer-events: auto;
  }
`

type Context = {
  getLock: (className: string, cursor: string) => () => void
}

type Lock = {className: string; cursor: string}

const context = createContext<Context>({} as $IntentionalAny)

const PointerEventsHandler: React.FC<{
  className?: string
}> = (props) => {
  const [locks, setLocks] = useState<Lock[]>([])
  const contextValue = useMemo<Context>(() => {
    const getLock = (className: string, cursor: string) => {
      const lock = {className, cursor}
      setLocks((s) => [...s, lock])
      const unlock = () => {
        setLocks((s) => s.filter((l) => l !== lock))
      }
      return unlock
    }
    return {
      getLock,
    }
  }, [])

  console.log(locks[0]?.cursor)

  return (
    <context.Provider value={contextValue}>
      <Container id={elementId} className={locks[0]?.className ?? 'normal'}>
        <CursorOverride style={{cursor: locks[0]?.cursor ?? ''}}>
          {props.children}
        </CursorOverride>
      </Container>
    </context.Provider>
  )
}

export const useCursorLock = (
  enabled: boolean,
  className: string,
  cursor: string,
) => {
  const ctx = useContext(context)
  useLayoutEffect(() => {
    if (!enabled) return
    return ctx.getLock(className, cursor)
  }, [enabled, className, cursor])
}

export default PointerEventsHandler
