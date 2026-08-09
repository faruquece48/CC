"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegistrationGate() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
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

            setPassword("");
            router.refresh();
        } catch {
            setError("Unable to verify the password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
            <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                <h1 className="text-xl font-bold text-gray-900">Test Registration</h1>
                <label htmlFor="test-registration-password" className="mb-2 mt-5 block text-sm font-semibold text-gray-700">
                    Admin password
                </label>
                <input
                    id="test-registration-password"
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
                    className="mt-5 w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                    {loading ? "Checking..." : "Open Test Registration"}
                </button>
            </form>
        </main>
    );
}
