'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SuccessPage() {

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {

        const timer = setTimeout(() => {
            router.push("/");
        }, 3000);

        return () => clearTimeout(timer);

    }, [router]);

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
                Redirecting to homepage...
            </p>

        </div>
    );
}