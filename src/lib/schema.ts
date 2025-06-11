import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organization: z.string().optional(),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

export const requestFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  organization: z.string().optional(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  backgroundPurpose: z.string()
    .min(1, 'Background and purpose is required')
    .max(1000, 'Background and purpose must be less than 1000 characters'),
  dataType: z.array(z.string())
    .min(1, 'At least one data type must be selected'),
  dataDetails: z.string()
    .max(1000, 'Data details must be less than 1000 characters')
    .optional(),
  dataVolume: z.string()
    .min(1, 'Data volume is required')
    .max(500, 'Data volume must be less than 500 characters'),
  deadline: z.string()
    .min(1, 'Deadline is required')
    .max(500, 'Deadline must be less than 500 characters'),
  budget: z.string()
    .min(1, 'Budget is required')
    .max(500, 'Budget must be less than 500 characters'),
  otherRequirements: z.string()
    .max(1000, 'Other requirements must be less than 1000 characters')
    .optional(),
});