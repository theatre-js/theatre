import type {ComponentType} from 'react'
import {useEffect} from 'react'
import {useSession} from 'next-auth/react'

export const withPageAuthRequired = (Component: ComponentType) => {
  return function WithPageAuthRequired(props: any): JSX.Element {
    const {data: session, status} = useSession()

    useEffect(() => {
      if (session?.user || status === 'loading') return
      let returnToPath: string

      const currentLocation = window.location.toString()
      returnToPath =
        currentLocation.replace(new URL(currentLocation).origin, '') || '/'

      window.location.assign(
        `/api/auth/signin?callbackUrl=${encodeURIComponent(returnToPath)}`,
      )
    }, [session, status])

    if (session?.user)
      return <Component user={session.user} {...(props as any)} />

    return <div>Redirecting...</div>
  }
}
