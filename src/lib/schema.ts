import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

export const requestFormSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Full name can only contain letters and spaces'),
  companyName: z.string().optional(),
  workEmail: z.string()
    .min(1, 'Work email is required')
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  dataType: z.string()
    .min(1, 'Data type is required')
    .max(500, 'Data type must be less than 500 characters'),
  dataAmount: z.string()
    .min(1, 'Data amount is required')
    .max(100, 'Data amount must be less than 100 characters')
    .regex(/^\d+$/, 'Data amount must be a number'),
  deadline: z.string()
    .min(1, 'Deadline is required')
    .max(100, 'Deadline must be less than 100 characters'),
  additionalDetails: z.string()
    .max(1000, 'Additional details must be less than 1000 characters')
    .optional(),
});