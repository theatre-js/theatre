'use client'

import {type FC} from 'react'
import type {PromptProps} from '~/app/_components/Prompts'
import {confirm, prompt} from '~/app/_components/Prompts'
import {DialogHeader, DialogTitle} from '~/ui/components/ui/dialog'
import * as schemas from '~/schemas'
import {Button} from '~/ui/components/ui/button'
import {api} from '~/trpc/react'
import {promptValue} from '~/app/_components/Prompts'
import {toast} from '~/ui/components/ui/use-toast'
import {Separator} from '~/ui/components/ui/separator'
import {useRouter} from 'next/navigation'

const AccountSettingsPrompt: FC<PromptProps<null>> = ({done}) => {
  const user = api.me.get.useQuery().data!
  const updateUser = api.me.update.useMutation().mutateAsync
  const deleteUser = api.me.delete.useMutation().mutateAsync
  const queryUtils = api.useUtils()

  const router = useRouter()

  return (
    <>
      <DialogHeader>
        <DialogTitle>Account Settings</DialogTitle>
      </DialogHeader>
      <div>
        <div className="font-bold">Name</div>
        <div className="flex items-center">
          <div className="text-sm">{user.name}</div>
          <Button
            variant="link"
            className="text-blue-500"
            onClick={async () => {
              const name = await promptValue.string('Change name', {
                defaultValue: user.name ?? '',
                schema: schemas.personLegalName,
              })

              if (!name) return

              try {
                await updateUser({
                  name,
                })
                void queryUtils.me.invalidate()
              } catch (err) {
                toast({
                  variant: 'destructive',
                  title: 'Uh oh! Something went wrong.',
                  description: "Couldn't update name.",
                })
              }
            }}
          >
            Edit
          </Button>
        </div>
      </div>
      <div>
        <div className="font-bold">Email</div>
        <div className="flex items-center">
          <div className="text-sm">{user.email}</div>
          <Button
            variant="link"
            className="text-blue-500"
            onClick={async () => {
              const email = await promptValue.string('Change email', {
                defaultValue: user.email ?? '',
                schema: schemas.email,
              })

              if (!email) return

              try {
                await updateUser({
                  email,
                })
                void queryUtils.me.invalidate()
              } catch (err) {
                toast({
                  variant: 'destructive',
                  title: 'Uh oh! Something went wrong.',
                  description: "Couldn't update email.",
                })
              }
            }}
          >
            Edit
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <Button
        variant="destructive"
        onClick={async () => {
          const response = await confirm(
            `Are you sure you want to delete your account?`,
            "This action can't be undone. Teams you are the only member of will be deleted as well and you won't be able to rejoin them later.",
          )

          if (!response) return

          try {
            await deleteUser({safety: `DELETE`})
            done(null)
            router.replace('/')
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: "Couldn't delete your account.",
            })
          }
        }}
      >
        Delete account
      </Button>
    </>
  )
}

export const promptAccountSettings = () =>
  prompt<null>((done) => <AccountSettingsPrompt done={done} />)
