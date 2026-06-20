import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'الاسم الأول مطلوب'),
  lastName: z.string().min(1, 'الاسم الأخير مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(8, 'رقم الهاتف غير صالح').optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  countryId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const otpSendSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine((data) => data.email || data.phone, {
  message: 'يجب إدخال البريد الإلكتروني أو رقم الهاتف',
});

export const otpVerifySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  code: z.string().length(6, 'الرمز يجب أن يكون 6 أرقام'),
});

export const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, 'أدخل البريد الإلكتروني أو رقم الهاتف'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'الرمز مطلوب'),
  newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
}).refine((data) => /[A-Z]/.test(data.newPassword) && /[a-z]/.test(data.newPassword) && /[0-9]/.test(data.newPassword), {
  message: 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، ورقم',
  path: ['newPassword'],
});
