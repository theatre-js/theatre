import SignIn from './_components/SignIn'
import {getAppSession} from '~/utils/authUtils'
import {redirect} from 'next/navigation'
import {api} from '~/trpc/server'

export default async function IndexPage() {
  const session = await getAppSession()

  if (session) {
    const teams = await api.teams.getAll.query()
    redirect(`/team/${teams[0].id}`)
  }

  return (
    <div>
      <SignIn />
    </div>
  )
}
