'use client'

import React from 'react'
import {api} from '~/trpc/server'
import AccountSetupForm from './_components/AccountSetupForm'

export default async function AccountSetupPage() {
  const user = await api.me.get.query()!

  return (
    <div>
      <AccountSetupForm name={user.name ?? ''} email={user.email ?? ''} />
    </div>
  )
}
