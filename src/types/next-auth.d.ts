import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    accountType: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      accountType: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string | null;
    image?: string | null;
    role?: string;
    accountType?: string;
  }
}
