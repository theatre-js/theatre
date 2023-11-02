'use client'

import {Suspense, type FC} from 'react'
import {api} from '~/trpc/react'
import {Button} from '~/ui/components/ui/button'
import {DialogHeader, DialogTitle} from '~/ui/components/ui/dialog'
import {Separator} from '~/ui/components/ui/separator'
import Members from './TeamMembers'
import {prompt} from 'react-promptify'
import {Input} from '~/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/ui/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/ui/components/ui/form'
import {useToast} from '~/ui/components/ui/use-toast'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'

const formSchema = z.object({
  email: z.string().email(),
  role: z.enum(['MEMBER', 'OWNER']),
})

const InviteTeamMembersPrompt: FC<{id: string}> = ({id}) => {
  const team = api.teams.get.useQuery({id}).data!
  const inviteMembers = api.teams.inviteMembers.useMutation().mutateAsync
  const queryUtils = api.useUtils()

  const {toast} = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await inviteMembers({
        id,
        invites: [{email: values.email, role: values.role}],
      })
      queryUtils.teams.invalidate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Make sure the initee has an account.',
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Invite Members to {team.name}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="janedoe@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({field}) => (
                <FormItem className="">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit">Invite</Button>
          </div>
        </form>
      </Form>
      <Separator className="my-4" />
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Members</h4>
        <Suspense fallback={<div>Loading...</div>}>
          <Members teamId={id} />
        </Suspense>
      </div>
    </>
  )
}

export const promptInviteMembers = (id: string) =>
  prompt<null>(() => <InviteTeamMembersPrompt id={id} />)
