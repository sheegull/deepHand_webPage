import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  organization: z.string().max(100).optional(),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required').max(1000)
});

const requestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  organization: z.string().max(100).optional(),
  email: z.string().email('Invalid email address'),
  backgroundPurpose: z.string().min(1, 'Background and purpose is required').max(1000),
  dataType: z.array(z.string()).min(1, 'At least one data type must be selected'),
  dataDetails: z.string().max(1000).optional(),
  dataVolume: z.string().min(1, 'Data volume is required').max(500),
  deadline: z.string().min(1, 'Deadline is required').max(500),
  budget: z.string().min(1, 'Budget is required').max(500),
  otherRequirements: z.string().max(1000).optional()
});

export const validateContactForm = (data: unknown) => {
  const result = contactSchema.safeParse(data);
  return result;
};

export const validateRequestForm = (data: unknown) => {
  const result = requestSchema.safeParse(data);
  return result;
};