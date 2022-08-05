import React, {useEffect, useState} from 'react'

enum ReadyState {
  Errored,
  Loaded,
  Loading,
  ShouldLoad,
  AskToLoad,
}

type ImportWithArgs<A extends any[]> = Readonly<
  [() => Promise<{loadStudio(...args: A): void | PromiseLike<void>}>, ...A]
>

/**
 * ```tsx
 * // creates the code split point, here 👇
 * <LazyLoadStudio load={() => import('./loadStudio')} />
 * ```
 *
 * ```ts
 * // in loadStudio.ts
 * import studio from '@theatre/studio';
 * import extension from '@theatre/r3f/dist/extension';
 *
 * export async function loadStudio() {
 *   studio.extend(extension);
 *   studio.initialize();
 * }
 * ```
 */
export function LazyLoadStudio<A extends any[]>(props: {
  import:
    | (() => Promise<{loadStudio(): void | PromiseLike<void>}>)
    | ImportWithArgs<A>
  /** Doesn't auto load if in iframe */
  autoLoad?: boolean
}) {
  const [error, setError] = useState<any>(undefined)
  const [state, setState] = useState(() =>
    // don't auto load if in iframe
    props.autoLoad && window.parent === window
      ? ReadyState.ShouldLoad
      : ReadyState.AskToLoad,
  )
  useEffect(() => {
    if (state === ReadyState.ShouldLoad) {
      setState(ReadyState.Loading)
      const loadPromise =
        typeof props.import === 'function'
          ? Promise.resolve(props.import()).then(({loadStudio}) => loadStudio())
          : (() => {
              const [fn, ...args] = props.import
              return Promise.resolve(fn()).then(({loadStudio}) =>
                loadStudio(...args),
              )
            })()

      loadPromise
        .then(() => setState(ReadyState.Loaded))
        .catch((err) => {
          setError(err)
          setState(ReadyState.Errored)
          console.error('LazyLoad errored', err)
        })
    }
  }, [state])

  return state === ReadyState.AskToLoad ? (
    <Container>
      <button onClick={() => setState(ReadyState.ShouldLoad)}>
        Load Studio
      </button>
    </Container>
  ) : state === ReadyState.Loading ? (
    <Container>Loading Studio</Container>
  ) : state === ReadyState.Errored ? (
    <Container>Errored: ${error?.toString()}</Container>
  ) : (
    <></>
  )
}

function Container(props: {children: React.ReactNode}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        color: 'white',
        background: 'rgba(0,0,0,0.3)',
        padding: '0.5rem',
        borderRadius: '0.25rem',
      }}
      children={props.children}
    />
  )
}
