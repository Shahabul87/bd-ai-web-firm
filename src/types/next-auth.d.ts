import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    clientId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    clientId?: string;
  }
}
