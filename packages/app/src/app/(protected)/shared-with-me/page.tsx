import {Suspense} from 'react'
import Shared from './_components/Shared'

export default function SharedWithME() {
  return (
    <div className="w--full h-screen">
      <Suspense>
        <Shared />
      </Suspense>
    </div>
  )
}
