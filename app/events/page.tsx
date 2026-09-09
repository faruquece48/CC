"use client";

import React, { useEffect, useState } from "react";

import {
	Card,
	CardBody,
	CardFooter,
	Image
} from "@nextui-org/react";

import { Button } from "@nextui-org/button";

import Link from "next/link";

import AdsterraBanner from "@/components/AdsterraBanner";

import { REGISTRATION_START_DATE } from "@/config/deadline";
import { rulebookAsset } from "@/config/assets";

export default function App() {

	const [rulebooksAvailable, setRulebooksAvailable] = useState(false);
	const [showRulebookNotice, setShowRulebookNotice] = useState(false);

	useEffect(() => {
		const registrationStart = new Date(REGISTRATION_START_DATE).getTime();
		const updateAvailability = () => {
			setRulebooksAvailable(Date.now() >= registrationStart);
		};

		updateAvailability();

		const remaining = registrationStart - Date.now();
		if (remaining <= 0) return;

		const timeout = window.setTimeout(updateAvailability, remaining + 100);
		return () => window.clearTimeout(timeout);
	}, []);

	// useEffect(() => {

	// 	const script =
	// 		document.createElement("script");

	// 	script.src =
	// 		"https://pl29564370.effectivecpmnetwork.com/09/be/29/09be2996f372ebe4f065a3e9b2ed42ed.js";

	// 	script.async = true;

	// 	document.body.appendChild(script);

	// 	return () => {

	// 		document.body.removeChild(script);

	// 	};

	// }, []);

	const list = [

		{
			title: "CAD Expert",
			img: "/images/cad.png",
			ruleBook: rulebookAsset("rulebook_CAD_Expert.pdf"),
			value: "cad",
			prizes: ["8K", "6K", "4K"],
		},

		{
			title: "Mechamind",
			img: "/images/mechamind.png",
			ruleBook: rulebookAsset("rulebook_Mechamind.pdf"),
			value: "mechamind",
			prizes: ["8K", "6K", "4K"],
		},

		{
			title: "Truss Combat",
			img: "/images/truss.png",
			ruleBook: rulebookAsset("rulebook_Truss_Combat.pdf"),
			value: "truss",
			prizes: ["12K", "8K", "5K"],
		},

		{
			title: "Management Maestro",
			img: "/images/management.png",
			ruleBook: rulebookAsset("rulebook_Management_Maestro.pdf"),
			value: "management",
			prizes: ["8K", "6K", "4K"],
		},

		{
			title: "Poster Presentation",
			img: "/images/poster.png",
			ruleBook: rulebookAsset("rulebook_Poster_Presentation.pdf"),
			value: "poster",
			prizes: ["8K", "6K", "4K"],
		}

	];
	

	return (

		<div>

			{showRulebookNotice && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
					role="presentation"
					onClick={() => setShowRulebookNotice(false)}
				>
					<div
						className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-2xl"
						role="dialog"
						aria-modal="true"
						aria-labelledby="rulebook-notice"
						onClick={(event) => event.stopPropagation()}
					>
						<p id="rulebook-notice" className="whitespace-nowrap text-lg font-medium text-gray-800">
							The rulebook will be available on{" "}
							<span className="bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 bg-clip-text font-bold text-transparent">
								15th August, 2026
							</span>.
						</p>

						<Button
							className="mt-6"
							color="primary"
							onPress={() => setShowRulebookNotice(false)}
						>
							OK
						</Button>
					</div>
				</div>
			)}

			{/* HERO TITLE SECTION */}

<section className="relative mx-4 mb-10 mt-5 overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-[#002d62] via-[#075a72] to-[#003b32] px-5 py-8 shadow-[0_24px_65px_rgba(0,45,66,0.28)] ring-1 ring-[#0b4d8a]/10 md:mx-8 md:rounded-[2.75rem] md:px-8 md:py-11 lg:mx-auto lg:max-w-7xl">
	<div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.17),transparent_27%),radial-gradient(circle_at_86%_82%,rgba(52,211,153,0.18),transparent_30%)]" />
	<div className="absolute -left-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
	<div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-amber-300/15" />

	<div className="relative z-10 mx-auto max-w-4xl text-center text-white">
		<h1 className="text-3xl font-extrabold tracking-wide md:text-5xl">
			OUR EVENTS
		</h1>

		<div className="mt-3 flex items-center justify-center gap-5">
			<div className="h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-[#dbe4ea] to-white md:w-44" />
			<div className="relative flex items-center justify-center">
				<div className="absolute h-8 w-8 rounded-full bg-white/20 blur-lg" />
				<div className="h-4 w-4 rotate-45 border border-white/70 bg-gradient-to-br from-white to-[#cbd5e1]" />
			</div>
			<div className="h-[2px] w-24 rounded-full bg-gradient-to-l from-transparent via-[#dbe4ea] to-white md:w-44" />
		</div>

		<p className="mt-2 text-xs leading-relaxed text-gray-200 md:text-base">
			Showcasing creativity, engineering skills, innovation, and competitive excellence.
		</p>
	</div>
</section>


			{/* Events Grid */}

			<div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8">

				{
					list.map((item, index) => (

						<Card
							shadow="sm"
							key={index}
							className="
								w-full
								sm:w-[320px]
								md:w-[300px]
								lg:w-[320px]
							"
						>

							{/* Image */}

							<CardBody className="overflow-visible p-0">

								<Image
									shadow="sm"
									radius="lg"
									width="100%"
									alt={item.title}
									className="
										w-full
										bg-slate-100
										object-cover
										h-[200px]
									"
									src={item.img}
								/>

							</CardBody>

							{/* Footer */}

							<CardFooter className="text-small flex flex-col justify-between">

								<b className="text-2xl text-center py-2">

									{item.title}

								</b>

								<div className="w-full rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-3 shadow-inner">
									<p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#075346]">Prize Pool</p>
									<div className="grid grid-cols-3 gap-2">
										{item.prizes.map((prize, prizeIndex) => (
											<div key={prize} className="flex flex-col items-center rounded-xl bg-white px-1 py-2 shadow-sm ring-1 ring-black/5">
												<span
													className="mb-1 block h-[46px] w-[44px] bg-[url('/images/prize-medals.png')] bg-[length:300%_100%] bg-no-repeat drop-shadow-[0_5px_5px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
													style={{ backgroundPosition: `${prizeIndex * 50}% center` }}
													aria-label={`${prizeIndex + 1}${prizeIndex === 0 ? "st" : prizeIndex === 1 ? "nd" : "rd"} position`}
													role="img"
												/>
												<span className="text-lg font-black leading-tight text-slate-800">{prize}</span>
												<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">BDT</span>
											</div>
										))}
									</div>
								</div>

								<div className="flex flex-row w-full mt-4 gap-3">

									{rulebooksAvailable ? (
										<Link
											className="w-full"
											href={item.ruleBook}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Button fullWidth size="md" variant="flat">
												Rulebook
											</Button>
										</Link>
									) : (
										<Button
											fullWidth
											size="md"
											variant="flat"
											onPress={() => setShowRulebookNotice(true)}
										>
											Rulebook
										</Button>
									)}

									{/* Registration */}

									<Link
										className="w-full"
										href={{
											pathname: "/registration",
											query: {
												selected: item.value
											},
										}}
									>

										<Button
											fullWidth
											size="md"
											color="primary"
										>

											Register

										</Button>

									</Link>

								</div>

							</CardFooter>

						</Card>
					))
				}

			</div>

			

		</div>
	);
}			
			
