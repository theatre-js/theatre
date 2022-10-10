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

/**
 * When the cursor is locked, this css var is added to #pointer-root
 * whose value will be the locked cursor (e.g. ew-resize).
 *
 * Look up references of this constant for examples of how it is used.
 *
 * See {@link useCssCursorLock} - code that locks the cursor
 */
export const lockedCursorCssVarName = '--lockedCursor'

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
  getLock: (className: string, cursor?: string) => () => void
}

type Lock = {className: string; cursor?: string}

const context = createContext<Context>({} as $IntentionalAny)

const PointerEventsHandler: React.FC<{
  className?: string
}> = (props) => {
  const [locks, setLocks] = useState<Lock[]>([])
  const contextValue = useMemo<Context>(() => {
    const getLock = (className: string, cursor?: string) => {
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

  const lockedCursor = locks[0]?.cursor ?? ''
  return (
    <context.Provider value={contextValue}>
      <Container
        id={elementId}
        className={(locks[0]?.className ?? 'normal') + ' ' + props.className}
      >
        <CursorOverride
          style={{
            cursor: lockedCursor,
            // @ts-ignore
            [lockedCursorCssVarName]: lockedCursor,
          }}
        >
          {props.children}
        </CursorOverride>
      </Container>
    </context.Provider>
  )
}

/**
 * A "locking" mechanism for managing style.cursor values.
 *
 * Putting this behind a lock is important so we can properly manage
 * multiple features all coordinating to style the cursor.
 *
 * This will also track a stack of different cursor styles so that
 * adding a style to be the "foremost" cursor can override a previous style,
 * but then "unlocking" that style will again reveal the existing styles.
 *
 * It behaves a bit like a stack.
 *
 * See {@link lockedCursorCssVarName}
 */
export const useCssCursorLock = (
  /** Whether to enable the provided cursor style */
  enabled: boolean,
  className: string,
  /** e.g. `"ew"`, `"help"`, `"pointer"`, `"text"`, etc */
  cursor?: string,
) => {
  const ctx = useContext(context)
  useLayoutEffect(() => {
    if (!enabled) return
    return ctx.getLock(className, cursor)
  }, [enabled, className, cursor])
}

export default PointerEventsHandler
