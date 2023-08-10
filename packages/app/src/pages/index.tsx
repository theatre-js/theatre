import React from 'react'
import {useUser} from '@auth0/nextjs-auth0/client'
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
  const {user, error, isLoading} = useUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  if (!user) {
    return <a href="/api/auth/login">log in</a>
  }

  return (
    <div>
      {/* <img src={user.picture} alt={user.name} /> */}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <Link href="/projects">Projects</Link> <br />
      <a href="/api/auth/logout">log out</a>
    </div>
  )
}
