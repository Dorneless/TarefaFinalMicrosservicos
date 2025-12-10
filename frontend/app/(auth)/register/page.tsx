import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
    title: "Cadastro",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <RegisterForm />
        </div>
    )
}
