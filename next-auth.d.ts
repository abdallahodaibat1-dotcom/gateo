import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      accountType: string;
      phone?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: string;
    accountType?: string;
    phone?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string | null;
    image?: string | null;
    role?: string;
    accountType?: string;
    phone?: string | null;
  }
}
