import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().max(25).optional().nullable(),
  destination: z.string().max(100).optional().nullable(),
  travel_dates: z.string().max(100).optional().nullable(),
  travelers_count: z.number().int().min(1).max(50).optional().default(1),
  budget: z.string().max(50).optional().nullable(),
  message: z.string().min(5, 'Please provide more details (at least 5 characters)').max(2000),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
