import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { AuthResponse, User } from "@/types";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                code: { label: "Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    return null;
                }

                try {
                    // Use environment variable for API URL
                    const userApiUrl = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:8080/api";

                    let response;
                    if (credentials.code) {
                        response = await axios.post<AuthResponse>(
                            `${userApiUrl}/auth/login-with-code`,
                            {
                                email: credentials.email,
                                code: credentials.code,
                            }
                        );
                    } else if (credentials.password) {
                        response = await axios.post<AuthResponse>(
                            `${userApiUrl}/auth/login`,
                            {
                                email: credentials.email,
                                password: credentials.password,
                            }
                        );
                    } else {
                        return null;
                    }

                    if (response.data && response.data.token) {
                        // Fetch user details to get role
                        try {
                            const userResponse = await axios.get<User>(`${userApiUrl}/users/me`, {
                                headers: {
                                    Authorization: `Bearer ${response.data.token}`
                                }
                            });

                            return {
                                id: userResponse.data.id,
                                email: userResponse.data.email,
                                name: userResponse.data.name,
                                role: userResponse.data.role,
                                accessToken: response.data.token,
                            };
                        } catch (userError) {
                            console.error("Failed to fetch user details:", userError);
                            return {
                                id: credentials.email,
                                email: credentials.email,
                                role: "USER", // Default
                                accessToken: response.data.token,
                            };
                        }
                    }
                    return null;
                } catch (error) {
                    console.error("Login failed:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Log trigger to see if it's an update, signin, or basic access
            // console.log(`[AuthDebug] JWT Callback. Trigger: ${trigger}, User: ${user?.email}`);
            if (user) {
                token.accessToken = user.accessToken;
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log(`[AuthDebug] Session Callback. Token Sub: ${token?.sub?.slice(0, 5)}...`);
            session.user.accessToken = token.accessToken as string;
            session.user.role = token.role as string;
            session.user.id = token.id as string;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
};
