import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

export const requestFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  companyName: z.string().optional(),
  workEmail: z.string().email('Invalid email address'),
  dataType: z.string().min(1, 'Data type is required'),
  dataAmount: z.string().min(1, 'Data amount is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  additionalDetails: z.string().optional(),
});