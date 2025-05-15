import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required').max(1000)
});

const requestSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  companyName: z.string().max(100).optional(),
  workEmail: z.string().email('Invalid email address'),
  dataType: z.string().min(1, 'Data type is required').max(500),
  dataAmount: z.string().min(1, 'Data amount is required').max(100),
  deadline: z.string().min(1, 'Deadline is required').max(100),
  additionalDetails: z.string().max(1000).optional()
});

export const validateContactForm = (data: unknown) => {
  const result = contactSchema.safeParse(data);
  return result;
};

export const validateRequestForm = (data: unknown) => {
  const result = requestSchema.safeParse(data);
  return result;
};