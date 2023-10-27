'use client'

import React from 'react'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import * as schemas from 'src/schemas'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/ui/components/ui/form'
import {Input} from 'src/ui/components/ui/input'
import {Button} from 'src/ui/components/ui/button'
import {api} from '~/trpc/react'
import {useRouter} from 'next/router'

const formSchema = z.object({
  name: schemas.personLegalName,
  email: schemas.email,
})

export default function AccountSetupForm({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      email,
    },
  })

  const {mutateAsync} = api.me.update.useMutation()

  const router = useRouter()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await mutateAsync({
        name: values.name,
        email: values.email,
      })

      void router.replace('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Your email address. People can use this to invite you to teams
                or workspaces.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
