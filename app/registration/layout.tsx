import { Suspense } from "react";

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex w-full flex-col items-center justify-center gap-4 px-4 py-8 md:px-8 md:py-10">
			<div className="w-full max-w-7xl text-center">
				<Suspense>
					{children}
				</Suspense>
			</div>
		</section>
	);
}
