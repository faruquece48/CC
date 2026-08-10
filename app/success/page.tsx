'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tranId = searchParams.get("tran_id");
        let redirectTimer: ReturnType<typeof setTimeout> | undefined;
        let active = true;

        const redirectHome = () => router.push("/");
        const fallbackTimer = setTimeout(redirectHome, 30_000);

        const processConfirmation = async () => {
            if (tranId) {
                try {
                    const response = await fetch("/api/payment-confirmation-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tranId }),
                    });
                    if (!response.ok) {
                        console.error("Confirmation email request failed with status:", response.status);
                    }
                } catch (error) {
                    console.error("Confirmation email request failed:", error);
                }
            }

            if (active) {
                clearTimeout(fallbackTimer);
                redirectTimer = setTimeout(redirectHome, 3_000);
            }
        };

        void processConfirmation();

        return () => {
            active = false;
            clearTimeout(fallbackTimer);
            if (redirectTimer) clearTimeout(redirectTimer);
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
