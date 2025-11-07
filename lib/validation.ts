import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת לה��יל לפחות 8 תווים"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "יש להסכים לתנאי השימוש",
  }),
})

export const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "נא להזין סיסמה"),
})

export const submitExamSchema = z.object({
  examId: z.string(),
  answers: z.record(z.string(), z.string()),
})

export const generateErrorExamSchema = z.object({
  attemptId: z.string(),
})
