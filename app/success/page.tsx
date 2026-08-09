'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tranId = searchParams.get("tran_id");
        const controller = new AbortController();

        if (tranId) {
            fetch("/api/payment-confirmation-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tranId }),
                signal: controller.signal,
            }).catch((error) => {
                if (error.name !== "AbortError") {
                    console.error("Confirmation email request failed:", error);
                }
            });
        }

        const timer = setTimeout(() => router.push("/"), 8000);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };

    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">

            <h1 className="text-4xl font-bold text-green-600">
                Payment Successful
            </h1>

            <p>
                Your payment has been successfully processed.
            </p>

            <p>
                Transaction ID: {searchParams.get("tran_id")}
            </p>

            <p>
                Your registration confirmation email is being prepared.
            </p>

            <p>
                Redirecting to homepage...
            </p>

        </div>
    );
}
