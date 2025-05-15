import { encode } from 'html-entities';

export const sanitizeInput = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = encode(value.trim());
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};