import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo').or(z.string().transform(Number)).pipe(z.number().positive()),
  type: z.enum(['income', 'expense'], { message: 'Tipo debe ser income o expense' }),
  category: z.string().min(1, 'Categoría requerida'),
  description: z.string().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD'),
  currency: z.string().default('C$'),
});

export const transactionUpdateSchema = transactionSchema.partial();

export const budgetSchema = z.object({
  category: z.string().min(1, 'Categoría requerida'),
  limitAmount: z.number().positive('El límite debe ser positivo').or(z.string().transform(Number)).pipe(z.number().positive()),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de mes YYYY-MM'),
});

export const budgetUpdateSchema = budgetSchema.partial();

export const goalSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  target: z.number().positive('La meta debe ser positiva').or(z.string().transform(Number)).pipe(z.number().positive()),
  current: z.number().min(0).default(0).or(z.string().transform(Number)).pipe(z.number().min(0)).default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD'),
});

export const depositSchema = z.object({
  amount: z.number().positive('El depósito debe ser positivo').or(z.string().transform(Number)).pipe(z.number().positive()),
});
