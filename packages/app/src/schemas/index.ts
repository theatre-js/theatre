import * as z from 'zod'

export const personLegalName = z
  .string()
  .min(2, {
    message: 'Name is too short',
  })
  .max(50, {
    message: 'Name is too long',
  })

export const email = z.string().email({
  message: 'Invalid email',
})

export const workspaceName = z
  .string()
  .min(2, {
    message: 'Name is too short',
  })
  .max(50, {
    message: 'Name is too long',
  })

export const teamName = z
  .string()
  .min(2, {
    message: 'Name is too short',
  })
  .max(50, {
    message: 'Name is too long',
  })

export const workspaceDescription = z.string().max(500, {
  message: 'Description is over 500 characters',
})
