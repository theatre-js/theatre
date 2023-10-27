import {Suspense} from 'react'
import Team from './components/Team'

export default function TeamPage({params: {id}}: {params: {id: string}}) {
  return (
    <div className="w--full h-screen">
      <Suspense>
        <Team id={id} />
      </Suspense>
    </div>
  )
}
