'use client'

import {Suspense} from 'react'
import {type CallbackFn, createPrompter} from 'react-promptify'
import {type ZodString, z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Button} from '~/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/ui/components/ui/dialog'
import {
  FormItem,
  FormField,
  FormMessage,
  FormControl,
  Form,
  FormLabel,
} from '~/ui/components/ui/form'
import {Input} from '~/ui/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/ui/components/ui/alert-dialog'

const {Prompter, prompt} = createPrompter()
const {Prompter: AlertPrompter, prompt: alert} = createPrompter()

export {prompt, alert}

export default function Prompts() {
  return (
    <>
      <Prompter>
        {({children, open, cancel}) => (
          <Dialog open={open} onOpenChange={(open) => open || cancel()}>
            <DialogContent className="sm:max-w-[425px]">
              <Suspense>{children}</Suspense>
            </DialogContent>
          </Dialog>
        )}
      </Prompter>
      <AlertPrompter>
        {({children, open}) => (
          <AlertDialog open={open}>
            <AlertDialogContent>{children}</AlertDialogContent>
          </AlertDialog>
        )}
      </AlertPrompter>
    </>
  )
}

export type PromptProps<T> = {done: CallbackFn<T | null>}

// A component returning a Dialog with a Form that has one field, a string input
const PromptString = ({
  done,
  message,
  defaultValue,
  label,
  schema,
}: PromptProps<string> & {
  message: string
  defaultValue: string
  label?: string
  schema: ZodString
}) => {
  const formSchema = z.object({
    value: schema,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: defaultValue,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    done(values.value)
  }

  return (
    <>
      <>
        <DialogHeader>
          <DialogTitle>{message}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="py-4">
              <FormField
                control={form.control}
                name="value"
                render={({field}) => (
                  <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => done(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </>
    </>
  )
}

export const promptValue = {
  string: (
    message: string,
    options?: {defaultValue?: string; label?: string; schema?: ZodString},
  ) => {
    const {defaultValue = '', label, schema = z.string()} = options ?? {}
    return prompt<string>((done) => (
      <PromptString
        done={done}
        message={message}
        defaultValue={defaultValue}
        schema={schema}
        label={label}
      />
    ))
  },
}

export const confirm = async (title: string, description: string) => {
  return alert<boolean>((done) => (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => done(false)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction onClick={() => done(true)}>
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  )) as Promise<boolean>
}
