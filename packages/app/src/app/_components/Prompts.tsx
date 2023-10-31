'use client'

import {Suspense} from 'react'
import {type CallbackFn, Prompter, prompt} from 'react-promptify'
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
} from '~/ui/components/ui/form'
import {Input} from '~/ui/components/ui/input'

export default function Prompts() {
  return (
    <Prompter>
      {({children, open, cancel}) => (
        <Dialog open={open} onOpenChange={(open) => open || cancel()}>
          <DialogContent className="sm:max-w-[425px]">
            <Suspense>{children}</Suspense>
          </DialogContent>
        </Dialog>
      )}
    </Prompter>
  )
}

export type PromptProps<T> = {done: CallbackFn<T | null>}

// A component returning a Dialog with a Form that has one field, a string input
const PromptString = ({
  done,
  message,
  defaultValue,
  schema,
}: PromptProps<string> & {
  message: string
  defaultValue: string
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

  console.log(message)

  return (
    <>
      <DialogContent>
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
      </DialogContent>
    </>
  )
}

export const promptValue = {
  string: (
    message: string,
    options?: {defaultValue?: string; schema?: ZodString},
  ) => {
    const {defaultValue = '', schema = z.string()} = options ?? {}
    return prompt<string>((done) => (
      <PromptString
        done={done}
        message={message}
        defaultValue={defaultValue}
        schema={schema}
      />
    ))
  },
}
