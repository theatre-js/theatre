'use client'

import {useState} from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from '~/ui/components/ui/dialog'
import {Input} from '~/ui/components/ui/input'
import {Button} from '~/ui/components/ui/button'
import {Plus} from 'lucide-react'
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
import {ToastAction} from '~/ui/components/ui/toast'
import {Loader} from 'lucide-react'

const formSchema = z.object({
  name: schemas.workspaceName,
  description: schemas.workspaceDescription,
})

export default function NewWorkspaceDialog({teamId}: {teamId: string}) {
  const [isOpen, setIsOpen] = useState(false)
  const {toast} = useToast()
  const {mutateAsync, isLoading} = api.workspaces.create.useMutation()
  const queryUtils = api.useUtils()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'New Workspace',
      description: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsOpen(false)
      await mutateAsync({
        name: values.name,
        description: values.description,
        teamId,
      })
      void queryUtils.teams.invalidate()
      void queryUtils.workspaces.invalidate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: "Couldn't create the workspace.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger asChild>
        <Button onClick={() => {}}>
          <Plus className="mr-2 h-4 w-4" />
          Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace for your team.
          </DialogDescription>
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
                {isLoading ? <Loader /> : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
