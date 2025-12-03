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
                    let response;
                    if (credentials.code) {
                        response = await axios.post<AuthResponse>(
                            "http://localhost:8080/api/auth/login-with-code",
                            {
                                email: credentials.email,
                                code: credentials.code,
                            }
                        );
                    } else if (credentials.password) {
                        response = await axios.post<AuthResponse>(
                            "http://localhost:8080/api/auth/login",
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
                            const userResponse = await axios.get<User>("http://localhost:8080/api/users/me", {
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
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
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
    },
};
