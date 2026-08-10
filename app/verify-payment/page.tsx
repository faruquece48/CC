import { CheckCircle2, CircleX } from "lucide-react";
import { sql } from "@vercel/postgres";
import { isValidPaymentVerificationToken } from "@/lib/paymentVerification";

export const dynamic = "force-dynamic";

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation",
};

export default async function VerifyPaymentPage({
    searchParams,
}: {
    searchParams: { transaction?: string; token?: string };
}) {
    const transactionId = searchParams.transaction || "";
    const token = searchParams.token || "";

    let validToken = false;
    try {
        validToken = isValidPaymentVerificationToken(transactionId, token);
    } catch {
        validToken = false;
    }

    if (!validToken) return <InvalidVerification />;

    const result = await sql`
        SELECT id, member_1, email, fee, tran_id
        FROM registrationData
        WHERE tran_id = ${transactionId} AND ispaid = TRUE
        LIMIT 1
    `;

    if (result.rowCount === 0) return <InvalidVerification />;

    const registration = result.rows[0];
    const events = await sql`
        SELECT event FROM (
            SELECT UNNEST(events) AS event
            FROM singleRegistrationData
            WHERE registration_id = ${registration.id}
            UNION
            SELECT event
            FROM teamRegistrationData
            WHERE registration_id = ${registration.id}
        ) AS registered_events
        ORDER BY event
    `;
    const email = String(registration.email || "");
    const [localPart, domain = ""] = email.split("@");
    const maskedEmail = `${localPart.slice(0, 2)}${"*".repeat(
        Math.max(2, localPart.length - 2),
    )}@${domain}`;

    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
            <section className="w-full max-w-xl overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-xl">
                <header className="bg-emerald-800 px-6 py-6 text-center text-white">
                    <CheckCircle2 className="mx-auto mb-3" size={42} aria-hidden="true" />
                    <h1 className="text-2xl font-bold">Verified Payment</h1>
                    <p className="mt-1 text-emerald-100">Construct Carnival 2.0</p>
                </header>
                <dl className="grid gap-5 p-6 sm:grid-cols-2">
                    <VerificationDetail label="Registration ID" value={String(registration.id)} />
                    <VerificationDetail label="Payment Status" value="Paid" accent />
                    <VerificationDetail label="Participant" value={registration.member_1} />
                    <VerificationDetail label="Email" value={maskedEmail} />
                    <VerificationDetail label="Amount" value={`${Number(registration.fee).toLocaleString()} BDT`} />
                    <VerificationDetail label="Transaction ID" value={registration.tran_id} />
                    <div className="sm:col-span-2">
                        <VerificationDetail
                            label="Registered Events"
                            value={events.rows.map((row) => eventNames[row.event] || row.event).join(", ") || "-"}
                        />
                    </div>
                </dl>
            </section>
        </main>
    );
}

function InvalidVerification() {
    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
            <section className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-xl">
                <CircleX className="mx-auto mb-3 text-red-600" size={42} aria-hidden="true" />
                <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                <p className="mt-3 text-gray-600">This payment slip is invalid or the registration is not marked as paid.</p>
            </section>
        </main>
    );
}

function VerificationDetail({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
            <dd className={`mt-1 break-words font-semibold ${accent ? "text-emerald-700" : "text-gray-900"}`}>{value}</dd>
        </div>
    );
}
