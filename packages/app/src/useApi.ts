import * as React from 'react'

function initialState(args: {
  error?: any
  isLoading?: boolean
  response?: any
}) {
  return {
    response: null,
    error: null,
    isLoading: true,
    ...args,
  }
}

const useApi = (
  url: RequestInfo,
  options = {},
): {
  error: unknown
  isLoading: boolean
  response: any
} => {
  const [state, setState] = React.useState(() => initialState({}))

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url, {
          ...options,
        })

        if (res.status >= 400) {
          setState(
            initialState({
              error: await res.json(),
              isLoading: false,
            }),
          )
        } else {
          setState(
            initialState({
              response: await res.json(),
              isLoading: false,
            }),
          )
        }
      } catch (error) {
        setState(
          initialState({
            error: {
              error: (error as any).message,
            },
            isLoading: false,
          }),
        )
      }
    }
    void fetchData()
  }, [options, url])
  return state
}

export default useApi
