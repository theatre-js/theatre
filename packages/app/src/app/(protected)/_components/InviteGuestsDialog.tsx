'use client'

import {Suspense} from 'react'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {api} from '~/trpc/react'
import {Avatar, AvatarFallback, AvatarImage} from '~/ui/components/ui/avatar'
import {Button} from '~/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from '~/ui/components/ui/dialog'
import {Input} from '~/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/ui/components/ui/select'
import {Separator} from '~/ui/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/ui/components/ui/form'
import {useToast} from '~/ui/components/ui/use-toast'

const formSchema = z.object({
  email: z.string().email(),
  accessLevel: z.enum(['READ', 'READ_WRITE']),
})

export default function InviteGuestsDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}) {
  const {mutateAsync: inviteGuests, isLoading} =
    api.workspaces.inviteGuests.useMutation()
  const queryUtils = api.useUtils()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      accessLevel: 'READ_WRITE',
    },
  })
  const {toast} = useToast()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await inviteGuests({
        id: workspaceId,
        invites: [{email: values.email, accessLevel: values.accessLevel}],
      })
      queryUtils.workspaces.invalidate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Make sure the guest has an account.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>Share this workspace</DialogHeader>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex space-x-2">
              {/* <Input value="http://example.com/link/to/document" readOnly />
              <Button variant="secondary" className="shrink-0">
                Invite
              </Button> */}
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
                name="accessLevel"
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
                        <SelectItem value="READ_WRITE">Edit</SelectItem>
                        <SelectItem value="READ">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Invite
              </Button>
            </div>
          </form>
        </Form>
        <Separator className="my-4" />
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Guests</h4>
          <Suspense fallback={<div>Loading...</div>}>
            <Guests workspaceId={workspaceId} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Guests({workspaceId}: {workspaceId: string}) {
  const guests = api.workspaces.getGuests.useQuery({id: workspaceId}).data!
  const {mutateAsync: removeGuest} = api.workspaces.removeGuest.useMutation()
  const {mutateAsync: changeAccessLevel} =
    api.workspaces.changeGuestAccess.useMutation()
  const queryUtils = api.useUtils()

  // if no guests, return a call to action
  if (guests.length === 0) {
    return (
      <DialogDescription>
        Invite people to collaborate on this workspace.
      </DialogDescription>
    )
  }

  async function handleRemoveGuest(email: string) {
    await removeGuest({id: workspaceId, email})
    queryUtils.workspaces.getGuests.invalidate()
  }

  async function handleChangeAccessLevel(
    email: string,
    accessLevel: 'READ' | 'READ_WRITE',
  ) {
    await changeAccessLevel({id: workspaceId, email, accessLevel})
    queryUtils.workspaces.getGuests.invalidate()
  }

  return (
    <div className="grid gap-6">
      {guests.map((guest) => (
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              {guest.accepted ? (
                <>
                  <AvatarImage src={guest.image ?? ''} />
                  <AvatarFallback>
                    {guest.name!.split(/\s/).map((part) => part.charAt(0))}
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarFallback className="border border-muted-foreground border-dashed bg-transparent" />
                </>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {guest.accepted ? guest.name : 'Invitation pending...'}
              </p>
              <p className="text-sm text-muted-foreground">{guest.email}</p>
            </div>
          </div>

          <Select
            value={guest.accessLevel}
            onValueChange={(accessLevel) =>
              handleChangeAccessLevel(
                guest.email,
                accessLevel as 'READ' | 'READ_WRITE',
              )
            }
          >
            <SelectTrigger className="ml-auto w-[110px]">
              <SelectValue defaultValue={guest.accessLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="READ_WRITE">Can edit</SelectItem>
              <SelectItem value="READ">Can view</SelectItem>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full h-8 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveGuest(guest.email)}
              >
                Remove
              </Button>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}
