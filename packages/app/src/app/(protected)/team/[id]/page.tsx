import {Suspense} from 'react'
import Team from './components/Team'
import {api} from '~/trpc/server'
import { redirect} from 'next/navigation'

export default async function TeamPage({params: {id}}: {params: {id: string}}) {
  try {
    const team = await api.teams.get.query({id})
  } catch (error) {
    // Ideally this would be notFound(), but that breaks for some reason and results in a not a server component error, when it is clearly one
    redirect('/')
  }

  return (
    <div className="w--full h-screen">
      <Suspense>
        <Team id={id} />
      </Suspense>
    </div>
  )
}
