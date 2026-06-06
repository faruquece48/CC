"use client";

import React, { useEffect } from "react";

import {
	Card,
	CardBody,
	CardFooter,
	Image
} from "@nextui-org/react";

import { Button } from "@nextui-org/button";

import Link from "next/link";

import AdsterraBanner from "@/components/AdsterraBanner";

export default function App() {

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
			ruleBook: "/rulebook/cad.pdf",
			value: "cad",
		},

		{
			title: "Mechamind",
			img: "/images/mechamind.png",
			ruleBook: "/rulebook/mechamind.pdf",
			value: "mechamind",
		},

		{
			title: "Truss Combat",
			img: "/images/truss.png",
			ruleBook: "/rulebook/truss.pdf",
			value: "truss",
		},

		{
			title: "Management Maestro",
			img: "/images/management.png",
			ruleBook: "/rulebook/management.pdf",
			value: "management",
		},

		{
			title: "Poster Presentation",
			img: "/images/poster.png",
			ruleBook: "/rulebook/poster.pdf",
			value: "poster",
		}

	];
	

	return (

		<div>

			{/* HERO TITLE SECTION */}

<section
	className="
		relative
		w-full
		py-8
		md:py-20
		mb-10
		bg-gradient-to-br
		from-[#002d62]
		via-[#0b4d8a]
		to-[#001B24]
		overflow-hidden
	"
>

	{/* Overlay */}

	<div className="absolute inset-0 bg-black/15" />

	<div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">

		{/* TITLE */}

		<h1 className="text-3xl md:text-5xl font-extrabold tracking-wide">

			OUR EVENTS

		</h1>

		{/* DIVIDER */}

		<div className="flex items-center justify-center mt-3 gap-5">

			{/* LEFT */}

			<div
				className="
					w-24 md:w-44
					h-[2px]
					bg-gradient-to-r
					from-transparent
					via-[#dbe4ea]
					to-[#ffffff]
					rounded-full
				"
			/>

			{/* CENTER */}

			<div className="relative flex items-center justify-center">

				<div className="absolute w-8 h-8 rounded-full bg-white/20 blur-lg" />

				<div
					className="
						w-4 h-4
						rotate-45
						bg-gradient-to-br
						from-white
						to-[#cbd5e1]
						border border-white/70
					"
				/>

			</div>

			{/* RIGHT */}

			<div
				className="
					w-24 md:w-44
					h-[2px]
					bg-gradient-to-l
					from-transparent
					via-[#dbe4ea]
					to-[#ffffff]
					rounded-full
				"
			/>

		</div>

		{/* TEXT */}

		<p className="mt-2 text-xs md:text-base text-gray-200 leading-relaxed">

			Showcasing creativity, engineering skills,
			innovation, and competitive excellence.

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

								<div className="flex flex-row w-full mt-4 gap-3">

									{/* Rulebook */}

									<Link
										className="w-full"
										href={item.ruleBook}
										target="_blank"
										rel="noopener noreferrer"
									>

										<Button
											fullWidth
											size="md"
											variant="flat"
										>

											Rulebook

										</Button>

									</Link>

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
			
