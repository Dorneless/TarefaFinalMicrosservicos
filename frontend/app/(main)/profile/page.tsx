import { Metadata } from "next";
import { ProfileContent } from "@/components/profile/profile-content";

export const metadata: Metadata = {
    title: "Perfil",
};

export default function ProfilePage() {
    return <ProfileContent />
}
