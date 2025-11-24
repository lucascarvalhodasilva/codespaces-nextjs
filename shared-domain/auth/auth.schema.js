import { z } from 'zod'

const emailSchema = z.string().email()
const passwordSchema = z.string().min(6)
const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters long')
  .max(32, 'Username must be at most 32 characters long')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, or dashes')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema
})