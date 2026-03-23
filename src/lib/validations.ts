import { z } from 'zod';
import { CategoryType, PaymentMethod } from './types';

const CATEGORY_TYPES: [CategoryType, ...CategoryType[]] = [
  'food',
  'transport',
  'rent',
  'utilities',
  'entertainment',
  'shopping',
  'health',
  'education',
  'savings',
  'other',
];

const PAYMENT_METHODS: [PaymentMethod, ...PaymentMethod[]] = [
  'cash',
  'card',
  'bank_transfer',
  'mobile_money',
];

export const expenseSchema = z.object({
  name: z.string().min(1, 'Description is required').max(100, 'Description is too long'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.enum(CATEGORY_TYPES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  note: z.string().max(500, 'Note is too long').optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const incomeSchema = z.object({
  name: z.string().min(1, 'Description is required').max(100, 'Description is too long'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  source: z.string().min(1, 'Source is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  note: z.string().max(500, 'Note is too long').optional(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
