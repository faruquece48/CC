// "use client";

// import Script from "next/script";
// import { useEffect, useState } from "react";

// export default function PopunderAd() {
// 	const [showAd, setShowAd] = useState(false);

// 	useEffect(() => {
// 		const lastShown = localStorage.getItem("popunderShown");

// 		// First visit
// 		if (!lastShown) {
// 			setShowAd(true);
// 			localStorage.setItem(
// 				"popunderShown",
// 				Date.now().toString()
// 			);
// 			return;
// 		}

// 		const now = Date.now();
// 		const diff = now - Number(lastShown);

// 		// 24 hours
// 		const limit = 5 * 60 * 1000;

// 		if (diff > limit) {
// 			setShowAd(true);

// 			localStorage.setItem(
// 				"popunderShown",
// 				Date.now().toString()
// 			);
// 		}
// 	}, []);

// 	if (!showAd) return null;

// 	return (
// 		<Script
// 			src="https://pl29574355.effectivecpmnetwork.com/9f/a3/58/9fa358fe86a564a7ef0c8b4e499d2ef3.js"
// 			strategy="afterInteractive"
// 		/>
// 	);
// }

"use client";

import Script from "next/script";

export default function PopunderAd() {
	return (
		<Script
			src="https://pl29574355.effectivecpmnetwork.com/9f/a3/58/9fa358fe86a564a7ef0c8b4e499d2ef3.js"
			strategy="afterInteractive"
		/>
	);
}