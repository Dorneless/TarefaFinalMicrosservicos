import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
    title: "Login",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
