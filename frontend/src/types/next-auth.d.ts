import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            accessToken: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: string
        accessToken: string
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role: string
        accessToken: string
    }
}
