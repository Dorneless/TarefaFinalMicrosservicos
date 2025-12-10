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
    trustHost: true,
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.user = {
                    ...user,
                    // Ensure these are available at the top level of token.user if needed, 
                    // or just rely on them being in the spread user object.
                    // We explicitly set them to ensure typescript happiness if needed, 
                    // but spreading user is the key to "save all info".
                }
                // Keep these top-level for backwards compatibility if other parts use them directly from token
                token.accessToken = (user as any).accessToken
                token.role = (user as any).role
                token.id = (user as any).id
            }

            if (trigger === "update" && session) {
                // Merge existing token.user with new session data
                token.user = {
                    ...(token.user as any),
                    ...session.user,
                }
            }

            return token
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = {
                    ...session.user,
                    ...(token.user as any), // Spread all properties from token.user (which comes from backend user)
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
