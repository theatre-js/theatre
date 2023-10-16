import React from 'react'
import {useSession, signIn, signOut} from 'next-auth/react'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      home
      <Profile />
    </div>
  )
}

const Profile: React.FC<{}> = () => {
  const {data: session, status} = useSession()
  const user = session?.user

  if (status === 'loading') return <div>Loading...</div>

  if (!user) {
    return <button onClick={() => signIn('github')}>Sign in</button>
  }

  return (
    <div>
      {/* <img src={user.picture} alt={user.name} /> */}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <Link href="/workspaces">Projects</Link> <br />
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
