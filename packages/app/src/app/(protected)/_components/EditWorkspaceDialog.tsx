'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/ui/components/ui/dialog'
import {Input} from '~/ui/components/ui/input'
import {Button} from '~/ui/components/ui/button'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import * as schemas from 'src/schemas'
import {api} from '~/trpc/react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/ui/components/ui/form'
import {useToast} from '~/ui/components/ui/use-toast'
import {Loader} from 'lucide-react'

const formSchema = z.object({
  name: schemas.workspaceName,
  description: schemas.workspaceDescription,
})

export default function EditWorkspaceDialog({
  workspace: {
    id: workspaceId,
    name: workspaceName,
    description: workspaceDescription,
  },
  open,
  onOpenChange,
}: {
  workspace: {
    id: string
    name: string
    description: string
  }
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}) {
  const {toast} = useToast()
  const {mutateAsync, isLoading} = api.workspaces.update.useMutation()
  const queryUtils = api.useUtils()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workspaceName,
      description: workspaceDescription,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      onOpenChange(false)
      await mutateAsync({
        id: workspaceId,
        name: values.name,
        description: values.description,
      })
      queryUtils.teams.invalidate()
      queryUtils.workspaces.invalidate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: "Couldn't update the workspace.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader /> : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
