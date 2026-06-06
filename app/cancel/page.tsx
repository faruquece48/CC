'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CancelPage() {

	const router = useRouter();

	const searchParams = useSearchParams();

	const tran_id = searchParams.get("tran_id");

	const status = searchParams.get("status");

	useEffect(() => {

		const timer = setTimeout(() => {
			router.push('/');
		}, 3000);

		return () => clearTimeout(timer);

	}, [router]);

	return (

		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

			<div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md w-full">

				<h1 className="text-4xl font-bold text-red-600">
					Payment Cancelled
				</h1>

				<p className="mt-4 text-gray-600">
					Your payment has been cancelled successfully.
				</p>

				{tran_id && (
					<p className="mt-3 font-medium break-all">
						Transaction ID: {tran_id}
					</p>
				)}

				{status && (
					<p className="mt-1 text-sm text-gray-500">
						Status: {status}
					</p>
				)}

				<p className="mt-5 text-sm text-gray-500">
					Redirecting to home page...
				</p>

			</div>

		</div>
	);
}