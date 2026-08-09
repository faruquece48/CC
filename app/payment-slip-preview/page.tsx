"use client";

import { CheckCircle2, LockKeyhole, ReceiptText } from "lucide-react";
import { FormEvent, useState } from "react";

const previewTeams = [
    {
        name: "Team Structure",
        event: "Truss Combat",
        members: ["Member One", "Member Two", "Member Three"],
    },
    {
        name: "Team Vision",
        event: "Poster Presentation",
        members: ["Member Four", "Member Five", "Member Six"],
    },
];

export default function PaymentSlipPreviewPage() {
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [verifiedPassword, setVerifiedPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailTestStatus, setEmailTestStatus] = useState("");
    const [sendingTestEmail, setSendingTestEmail] = useState(false);

    const authenticate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                setError("Incorrect password");
                return;
            }

            setVerifiedPassword(password);
            setAuthenticated(true);
            setPassword("");
        } catch {
            setError("Unable to verify the password");
        } finally {
            setLoading(false);
        }
    };

    const sendTestEmail = async () => {
        setSendingTestEmail(true);
        setEmailTestStatus("");

        try {
            const response = await fetch("/api/test-payment-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: verifiedPassword }),
            });
            const result = await response.json();
            setEmailTestStatus(result.message || "Unable to send test email.");
        } catch {
            setEmailTestStatus("Unable to send test email.");
        } finally {
            setSendingTestEmail(false);
        }
    };

    if (!authenticated) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
                <form
                    onSubmit={authenticate}
                    className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
                >
                    <div className="mb-5 flex items-center gap-3">
                        <LockKeyhole className="text-emerald-700" aria-hidden="true" />
                        <h1 className="text-xl font-bold text-gray-900">Payment Slip Preview</h1>
                    </div>
                    <label htmlFor="preview-password" className="mb-2 block text-sm font-semibold text-gray-700">
                        Admin password
                    </label>
                    <input
                        id="preview-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Checking..." : "View Preview"}
                    </button>
                </form>
            </main>
        );
    }

    return (
        <main className="bg-gray-100 px-4 py-12">
            <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-medium text-sky-900">
                    {emailTestStatus || "Send this slip to the latest paid registration email."}
                </p>
                <button
                    type="button"
                    onClick={sendTestEmail}
                    disabled={sendingTestEmail}
                    className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
                >
                    {sendingTestEmail ? "Sending..." : "Send Local Test Email"}
                </button>
            </div>
            <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                <header className="border-b border-gray-200 bg-white px-6 py-6 text-center">
                    <img
                        src="/logo/blue-main_x1024.png"
                        alt="Construct Carnival logo"
                        className="mx-auto h-20 w-20 object-contain"
                    />
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">Construct Carnival 2.0</h1>
                    <p className="mt-1 font-semibold text-sky-700">Building Future, Managing Reality</p>
                </header>

                <div className="flex items-center justify-center gap-3 bg-emerald-900 px-6 py-4 text-white">
                    <CheckCircle2 size={28} aria-hidden="true" />
                    <h2 className="text-xl font-bold">Payment Confirmed</h2>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
                        <div>
                            <p className="text-sm text-gray-500">Confirmation for</p>
                            <p className="font-bold text-gray-900">Sample Participant</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <ReceiptText size={18} aria-hidden="true" />
                            PAYMENT SLIP
                        </div>
                    </div>

                    <section className="border-l-4 border-emerald-500 bg-emerald-50 p-4">
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <Detail label="Registration ID" value="1001" />
                            <Detail label="Payment Status" value="Paid" accent />
                            <Detail label="Transaction ID" value="BECMCC20-1001-123456789012" />
                            <Detail label="Gateway Transaction" value="SSL-DEMO-987654" />
                            <Detail label="Amount" value="1,000 BDT" />
                            <Detail label="Payment Date" value="15 August 2026" />
                        </dl>
                    </section>

                    <section className="mt-7">
                        <h2 className="mb-3 text-lg font-bold text-gray-900">Individual Event Registration</h2>
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-gray-100 text-left text-gray-700">
                                    <tr><th className="p-3">Participant</th><th className="p-3">Events</th><th className="p-3">Email</th></tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-gray-200">
                                        <td className="p-3">Sample Participant</td>
                                        <td className="p-3">CAD Expert, Mechamind</td>
                                        <td className="p-3">participant@example.com</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mt-7">
                        <h2 className="mb-3 text-lg font-bold text-gray-900">Team Event Registration</h2>
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="bg-gray-100 text-left text-gray-700">
                                    <tr><th className="p-3">Team</th><th className="p-3">Event</th><th className="p-3">Member</th></tr>
                                </thead>
                                <tbody>
                                    {previewTeams.flatMap((team) =>
                                        team.members.map((member, index) => (
                                            <tr key={`${team.name}-${member}`} className="border-t border-gray-200">
                                                {index === 0 && (
                                                    <td
                                                        rowSpan={team.members.length}
                                                        className="border-r border-gray-200 p-3 align-middle font-semibold"
                                                    >
                                                        {team.name}
                                                    </td>
                                                )}
                                                {index === 0 && (
                                                    <td
                                                        rowSpan={team.members.length}
                                                        className="border-r border-gray-200 p-3 align-middle"
                                                    >
                                                        {team.event}
                                                    </td>
                                                )}
                                                <td className="p-3">{member}</td>
                                            </tr>
                                        )),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <p className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-500">
                        This is an electronically generated payment slip and requires no further verification.
                    </p>

                    <footer className="mt-14 flex justify-end">
                        <div className="w-56 text-center">
                            <img
                                src="/images/signature.png"
                                alt="Electronic signature of Event Head"
                                className="mx-auto mb-1 h-24 w-auto object-contain"
                            />
                            <div className="border-t border-gray-700 pt-2 font-semibold text-gray-900">
                                Signature of Event Head
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Construct Carnival 2.0</p>
                        </div>
                    </footer>
                </div>
            </div>
        </main>
    );
}

function Detail({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
            <dd className={`mt-1 font-semibold ${accent ? "text-emerald-700" : "text-gray-900"}`}>{value}</dd>
        </div>
    );
}
