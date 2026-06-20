import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateAppleClientSecret } from '@/lib/apple';
import { z } from 'zod';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

const credentialsSchema = z.object({
  emailOrPhone: z.string().min(1, 'أدخل البريد أو رقم الهاتف'),
  password: z.string().min(6, 'كلمة المرور قصيرة'),
});

const otpCredentialsSchema = z.object({
  phone: z.string().min(1, 'أدخل رقم الهاتف'),
  otp: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const appleEnabled =
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    ...(appleEnabled
      ? [
          Apple({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: generateAppleClientSecret(),
            authorization: {
              params: {
                response_mode: 'form_post',
                response_type: 'code',
                scope: 'name email',
              },
            },
          }),
        ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH DEBUG] credentials received:', JSON.stringify(credentials));
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log('[AUTH DEBUG] parse error:', parsed.error.format());
          return null;
        }

        const { emailOrPhone, password } = parsed.data;
        console.log('[AUTH DEBUG] parsed:', { emailOrPhone, passwordLength: password.length });
        const lookupField = isEmail(emailOrPhone) ? 'email' : 'phone';
        const normalizedValue = lookupField === 'email' ? emailOrPhone.toLowerCase().trim() : emailOrPhone.trim();

        const user = await prisma.user.findUnique({
          where: lookupField === 'email' ? { email: normalizedValue } : { phone: normalizedValue },
        });

        // Generic failure: user not found or no password set
        if (!user || !user.password) {
          return null;
        }

        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          const failedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lastFailedLoginAt: new Date(),
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                : user.lockedUntil,
            },
          });
          return null;
        }

        // Block admin users from the main login provider
        if (user.role === 'ADMIN') {
          return null;
        }

        // Successful login: reset security counters
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          image: user.avatar,
          role: user.role,
          accountType: user.accountType,
        };
      },
    }),
    Credentials({
      id: 'phone-otp',
      name: 'phone-otp',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = otpCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, otp } = parsed.data;
        const normalizedPhone = phone.trim();

        const user = await prisma.user.findUnique({
          where: { phone: normalizedPhone },
        });

        if (!user) return null;

        // Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        if (user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
          return null;
        }

        // Block admin users from the main login provider
        if (user.role === 'ADMIN') {
          return null;
        }

        // Clear OTP and mark phone verified
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otpCode: null,
            otpExpiresAt: null,
            phoneVerified: new Date(),
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          image: user.avatar,
          role: user.role,
          accountType: user.accountType,
        };
      },
    }),
    Credentials({
      id: 'admin-credentials',
      name: 'admin-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse({
          emailOrPhone: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        const { emailOrPhone, password } = parsed.data;
        const normalizedEmail = emailOrPhone.toLowerCase().trim();

        // Admin provider only accepts email and only ADMIN role
        if (!isEmail(normalizedEmail)) return null;

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) return null;
        if (user.role !== 'ADMIN') return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          const failedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lastFailedLoginAt: new Date(),
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                : user.lockedUntil,
            },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          image: user.avatar,
          role: user.role,
          accountType: user.accountType,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      const provider = account?.provider;
      if ((provider === 'google' || provider === 'apple') && user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: user.name || normalizedEmail.split('@')[0],
              avatar: user.image || null,
              emailVerified: new Date(),
              Profile: { create: {} },
            },
          });
          user.id = newUser.id;
          user.role = newUser.role;
          user.accountType = newUser.accountType;
        } else if (existingUser.emailVerified) {
          // Only auto-link OAuth to an existing account if the email was verified.
          const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              avatar: user.image || existingUser.avatar,
              emailVerified: existingUser.emailVerified || new Date(),
              lastLoginAt: new Date(),
            },
          });
          user.id = updatedUser.id;
          user.role = updatedUser.role;
          user.accountType = updatedUser.accountType;
        } else {
          // Refuse to link OAuth to an unverified local account to prevent
          // account takeover / data cross-contamination.
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
        token.accountType = user.accountType;
        token.phone = user.phone;
      }
      if (account?.provider === 'google' || account?.provider === 'apple') {
        token.provider = account.provider;
      }
      // Handle client-side session updates (e.g. after profile/avatar change)
      if (trigger === 'update' && session) {
        if (session.avatar !== undefined) token.image = session.avatar;
        if (session.name !== undefined) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | undefined;
        session.user.image = token.image as string | undefined;
        session.user.role = token.role as string;
        session.user.accountType = token.accountType as string;
        session.user.phone = token.phone as string | undefined;
      }
      return session;
    },
  },
});
