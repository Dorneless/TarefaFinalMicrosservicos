import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

async function loginWithPassword(email: string, password: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_USER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        throw new Error("Credenciais inválidas")
    }

    return res.json()
}

async function loginWithCode(email: string, code: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_USER_URL}/api/auth/login-with-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
    })

    if (!res.ok) {
        throw new Error("Código inválido ou expirado")
    }

    return res.json()
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            authorize: async (credentials) => {
                let user = null

                const { email, password, code } = credentials

                if (code) {
                    // Login with code
                    const data = await loginWithCode(email as string, code as string)
                    user = { ...data.user, accessToken: data.token }
                } else if (password) {
                    // Login with password
                    const data = await loginWithPassword(email as string, password as string)
                    user = { ...data.user, accessToken: data.token }
                }

                if (!user) {
                    throw new Error("Dados de login incompletos")
                }

                return user
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken
                token.role = (user as any).role
                token.id = (user as any).id
                token.user = user
            }
            return token
        },
        async session({ session, token }) {
            if (token.user) {
                session.user.id = (token.user as any).id
                session.user.role = (token.user as any).role
                session.user.accessToken = (token.user as any).accessToken
                session.user.name = (token.user as any).name
                session.user.email = (token.user as any).email
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
