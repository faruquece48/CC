import { cookies } from "next/headers";
import RegistrationPage from "@/components/registrationPage";
import AdminRegistrationGate from "@/components/adminRegistrationGate";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export default function TestRegistrationPage() {
    const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;

    if (!isValidAdminSession(session)) {
        return <AdminRegistrationGate />;
    }

    return <RegistrationPage testMode />;
}
