import { Suspense } from "react";

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex w-full flex-col items-center justify-center gap-4 px-4 pb-8 pt-[10px] md:px-8 md:pb-10">
			<div className="w-full max-w-7xl text-center">
				<Suspense>
					{children}
				</Suspense>
			</div>
		</section>
	);
}
