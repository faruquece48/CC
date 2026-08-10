"use client";

import { CheckCircle2, LockKeyhole, ReceiptText, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const eventNames: Record<string, string> = {
    cad: "CAD Expert",
    mechamind: "Mechamind",
    management: "Management Maestro",
    truss: "Truss Combat",
    poster: "Poster Presentation",
};

type PaidRegistration = {
    id: number;
    maskedEmail: string;
};

type PreviewRegistration = {
    id: number;
    memberName: string;
    email: string;
    phone: string;
    fee: number | string;
    transactionId: string;
    verificationQr: string;
    individual: Array<{ name: string; email: string; events: string[] }>;
    teams: Array<{
        event: string;
        teamname: string;
        members: Array<{ name: string }>;
    }>;
};

export default function PaymentSlipPreviewPage() {
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [verifiedPassword, setVerifiedPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailTestStatus, setEmailTestStatus] = useState("");
    const [sendingTestEmail, setSendingTestEmail] = useState(false);
    const [paidRegistrations, setPaidRegistrations] = useState<PaidRegistration[]>([]);
    const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<number[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [registrationSearch, setRegistrationSearch] = useState("");
    const [previewRegistration, setPreviewRegistration] = useState<PreviewRegistration | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        const registrationId = selectedRegistrationIds[0];
        if (!authenticated || !verifiedPassword || !registrationId) {
            setPreviewRegistration(null);
            return;
        }

        const controller = new AbortController();
        setLoadingPreview(true);

        fetch("/api/payment-slip-preview-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: verifiedPassword, registrationId }),
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then((result) => setPreviewRegistration(result.registration || null))
            .catch((requestError) => {
                if (requestError.name !== "AbortError") setPreviewRegistration(null);
            })
            .finally(() => setLoadingPreview(false));

        return () => controller.abort();
    }, [authenticated, selectedRegistrationIds, verifiedPassword]);

    const loadPaidRegistrations = async (adminPassword: string) => {
        setLoadingRegistrations(true);
        try {
            const response = await fetch("/api/paid-registration-ids", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: adminPassword }),
            });
            const result = await response.json();
            setPaidRegistrations(result.registrations || []);
        } catch {
            setEmailTestStatus("Unable to load paid registrations.");
        } finally {
            setLoadingRegistrations(false);
        }
    };

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
            void loadPaidRegistrations(password);
            setPassword("");
        } catch {
            setError("Unable to verify the password");
        } finally {
            setLoading(false);
        }
    };

    const sendTestEmails = async () => {
        setSendingTestEmail(true);
        setEmailTestStatus("");

        let sent = 0;
        const failed: number[] = [];

        for (const registrationId of selectedRegistrationIds) {
            try {
                const response = await fetch("/api/test-payment-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        password: verifiedPassword,
                        registrationId,
                    }),
                });
                if (response.ok) sent += 1;
                else failed.push(registrationId);
            } catch {
                failed.push(registrationId);
            }
        }

        setEmailTestStatus(
            failed.length === 0
                ? `${sent} payment slip${sent === 1 ? "" : "s"} accepted for delivery.`
                : `${sent} sent. Failed IDs: ${failed.join(", ")}.`,
        );
        setSendingTestEmail(false);
    };

    const toggleRegistration = (registrationId: number) => {
        setSelectedRegistrationIds((current) =>
            current.includes(registrationId)
                ? current.filter((id) => id !== registrationId)
                : [...current, registrationId],
        );
    };

    const filteredPaidRegistrations = paidRegistrations.filter((registration) =>
        String(registration.id).includes(registrationSearch.trim()),
    );

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
            <div className="mx-auto mb-6 max-w-3xl rounded-lg border border-sky-200 bg-sky-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-sky-950">Paid Registration IDs</h2>
                        <p className="text-sm text-sky-800">{selectedRegistrationIds.length} selected</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedRegistrationIds(filteredPaidRegistrations.map((item) => item.id))}
                            disabled={filteredPaidRegistrations.length === 0}
                            className="rounded-md border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-800 disabled:opacity-50"
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRegistrationIds([])}
                            disabled={selectedRegistrationIds.length === 0}
                            className="rounded-md border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-800 disabled:opacity-50"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="relative mt-4">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-700"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        inputMode="numeric"
                        value={registrationSearch}
                        onChange={(event) => setRegistrationSearch(event.target.value.replace(/\D/g, ""))}
                        placeholder="Search Registration ID"
                        aria-label="Search Registration ID"
                        className="w-full rounded-md border border-sky-300 bg-white py-2 pl-10 pr-3 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                    />
                </div>

                <div className="my-4 max-h-56 overflow-y-auto rounded-md border border-sky-200 bg-white">
                    {loadingRegistrations ? (
                        <p className="p-4 text-sm text-gray-500">Loading paid registrations...</p>
                    ) : filteredPaidRegistrations.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">
                            {registrationSearch ? "No matching paid Registration ID." : "No paid registrations found."}
                        </p>
                    ) : (
                        filteredPaidRegistrations.map((registration) => (
                            <label
                                key={registration.id}
                                className="flex cursor-pointer items-center justify-between gap-4 border-b border-sky-100 px-4 py-3 last:border-b-0 hover:bg-sky-50"
                            >
                                <span className="flex items-center gap-3 font-semibold text-gray-900">
                                    <input
                                        type="checkbox"
                                        checked={selectedRegistrationIds.includes(registration.id)}
                                        onChange={() => toggleRegistration(registration.id)}
                                        className="h-4 w-4 accent-sky-700"
                                    />
                                    #{registration.id}
                                </span>
                                <span className="text-sm text-gray-500">{registration.maskedEmail}</span>
                            </label>
                        ))
                    )}
                </div>

                <button
                    type="button"
                    onClick={sendTestEmails}
                    disabled={sendingTestEmail || selectedRegistrationIds.length === 0}
                    className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {sendingTestEmail
                        ? "Sending..."
                        : `Send ${selectedRegistrationIds.length || "Selected"} Slip${selectedRegistrationIds.length === 1 ? "" : "s"}`}
                </button>
                {emailTestStatus && (
                    <p className="mt-3 text-sm font-medium text-sky-900">{emailTestStatus}</p>
                )}
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
                            <p className="font-bold text-gray-900">
                                {loadingPreview
                                    ? "Loading registration..."
                                    : previewRegistration?.memberName || "Select a paid Registration ID"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <ReceiptText size={18} aria-hidden="true" />
                            PAYMENT SLIP
                        </div>
                    </div>

                    <section className="border-l-4 border-emerald-500 bg-emerald-50 p-4">
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <Detail label="Registration ID" value={previewRegistration ? String(previewRegistration.id) : "-"} />
                            <Detail label="Payment Status" value={previewRegistration ? "Paid" : "-"} accent={Boolean(previewRegistration)} />
                            <Detail label="Transaction ID" value={previewRegistration?.transactionId || "-"} />
                            <Detail label="Email" value={previewRegistration?.email || "-"} />
                            <Detail label="Phone" value={previewRegistration?.phone || "-"} />
                            <Detail label="Amount" value={previewRegistration ? `${Number(previewRegistration.fee).toLocaleString()} BDT` : "-"} />
                        </dl>
                    </section>

                    {previewRegistration && previewRegistration.individual.length > 0 && (
                        <section className="mt-7">
                            <h2 className="mb-3 text-lg font-bold text-gray-900">Individual Event Registration</h2>
                            <div className="overflow-x-auto rounded-md border border-gray-200">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead className="bg-gray-100 text-left text-gray-700">
                                        <tr><th className="p-3">Participant</th><th className="p-3">Events</th><th className="p-3">Email</th></tr>
                                    </thead>
                                    <tbody>
                                        {previewRegistration.individual.map((participant) => (
                                            <tr key={`${participant.email}-${participant.events.join("-")}`} className="border-t border-gray-200">
                                                <td className="p-3">{participant.name}</td>
                                                <td className="p-3">
                                                    {participant.events.map((event) => eventNames[event] || event).join(", ")}
                                                </td>
                                                <td className="p-3">{participant.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {previewRegistration && previewRegistration.teams.length > 0 && (
                        <section className="mt-7">
                            <h2 className="mb-3 text-lg font-bold text-gray-900">Team Event Registration</h2>
                            <div className="overflow-x-auto rounded-md border border-gray-200">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead className="bg-gray-100 text-left text-gray-700">
                                        <tr><th className="p-3">Team</th><th className="p-3">Event</th><th className="p-3">Member</th></tr>
                                    </thead>
                                    <tbody>
                                        {previewRegistration.teams.flatMap((team) =>
                                            team.members.map((member, index) => (
                                                <tr key={`${team.teamname}-${team.event}-${index}`} className="border-t border-gray-200">
                                                    {index === 0 && (
                                                        <td rowSpan={team.members.length} className="border-r border-gray-200 p-3 align-middle font-semibold">
                                                            {team.teamname}
                                                        </td>
                                                    )}
                                                    {index === 0 && (
                                                        <td rowSpan={team.members.length} className="border-r border-gray-200 p-3 align-middle">
                                                            {eventNames[team.event] || team.event}
                                                        </td>
                                                    )}
                                                    <td className="p-3">{member.name}</td>
                                                </tr>
                                            )),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {previewRegistration && (
                        <section className="mt-8 text-center">
                            <h2 className="text-lg font-bold text-gray-900">Verify This Payment</h2>
                            <img
                                src={previewRegistration.verificationQr}
                                alt="Payment verification QR code"
                                className="mx-auto mt-3 h-44 w-44"
                            />
                            <p className="mt-2 text-sm text-gray-500">Scan the QR code to verify this payment.</p>
                        </section>
                    )}

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
