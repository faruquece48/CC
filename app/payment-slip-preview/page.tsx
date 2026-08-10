"use client";

import { LockKeyhole, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type PaidRegistration = {
    id: number;
    maskedEmail: string;
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
    const [previewPdfUrl, setPreviewPdfUrl] = useState("");
    const [previewError, setPreviewError] = useState("");
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        const registrationId = selectedRegistrationIds[0];
        if (!authenticated || !verifiedPassword || !registrationId) {
            setPreviewPdfUrl("");
            setPreviewError("");
            return;
        }

        const controller = new AbortController();
        let objectUrl = "";
        let active = true;
        setLoadingPreview(true);
        setPreviewError("");

        fetch("/api/payment-slip-preview-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: verifiedPassword, registrationId }),
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    const result = await response.json().catch(() => null);
                    throw new Error(result?.message || "Unable to generate the PDF preview.");
                }
                return response.blob();
            })
            .then((pdf) => {
                if (!active) return;
                objectUrl = URL.createObjectURL(pdf);
                setPreviewPdfUrl(objectUrl);
            })
            .catch((requestError) => {
                if (active && requestError.name !== "AbortError") {
                    setPreviewPdfUrl("");
                    setPreviewError(requestError.message || "Unable to generate the PDF preview.");
                }
            })
            .finally(() => {
                if (active) setLoadingPreview(false);
            });

        return () => {
            active = false;
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
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
        const failed: Array<{ id: number; message: string }> = [];

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
                const result = await response.json().catch(() => null);
                if (response.ok) {
                    sent += 1;
                } else {
                    failed.push({
                        id: registrationId,
                        message: result?.message || `Request failed with status ${response.status}.`,
                    });
                }
            } catch {
                failed.push({
                    id: registrationId,
                    message: "The request could not reach the email endpoint.",
                });
            }
        }

        setEmailTestStatus(
            failed.length === 0
                ? `${sent} payment slip${sent === 1 ? "" : "s"} accepted for delivery.`
                : `${sent} sent. ${failed
                    .map(({ id, message }) => `Registration #${id}: ${message}`)
                    .join(" ")}`,
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
            <section className="mx-auto w-full max-w-4xl">
                {loadingPreview ? (
                    <div className="flex aspect-[210/297] items-center justify-center border border-gray-300 bg-white text-sm font-medium text-gray-500 shadow-xl">
                        Generating A4 preview...
                    </div>
                ) : previewError ? (
                    <div className="border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
                        {previewError}
                    </div>
                ) : previewPdfUrl ? (
                    <iframe
                        src={previewPdfUrl}
                        title="A4 payment slip preview"
                        className="aspect-[210/297] w-full border border-gray-300 bg-white shadow-xl"
                    />
                ) : (
                    <div className="flex aspect-[210/297] items-center justify-center border border-gray-300 bg-white px-6 text-center text-sm font-medium text-gray-500 shadow-xl">
                        Select a paid Registration ID to preview its A4 payment slip.
                    </div>
                )}
            </section>
        </main>
    );
}
