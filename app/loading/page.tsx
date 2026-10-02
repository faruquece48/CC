import { cookies } from "next/headers";
import AdminRegistrationGate from "@/components/adminRegistrationGate";
import LoadingControl from "@/components/LoadingControl";
import { ADMIN_SESSION_COOKIE,isValidAdminSession } from "@/lib/adminSession";
export const dynamic="force-dynamic";
export default function LoadingPage(){return isValidAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value)?<LoadingControl/>:<AdminRegistrationGate title="Truss Loading Control" buttonLabel="Open Loading Control"/>}