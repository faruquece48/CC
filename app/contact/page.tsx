import ContactForm from "@/components/contactform";
import AdsterraBanner from "@/components/AdsterraBanner";
import { title } from "@/components/primitives";

export default function ContactPage() {
	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
			<div className="flex flex-col">
				{/* Page Title */}
				<h1
					className={title({
						class:
							"text-red-600 dark:text-red-400 text-center",
					})}
				>
					Contact Us
				</h1>

				{/* Main Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14 items-stretch">
					{/* Left Info Section */}
					<div
						className="
							flex
							flex-col
							justify-between
							gap-10
							p-8
							bg-white
							dark:bg-gray-900
							border
							border-slate-200
							dark:border-gray-700
							rounded-3xl
							shadow-[0_8px_30px_rgb(0,0,0,0.06)]
							h-full
						"
					>
						<div>
							<h1 className="text-4xl font-bold mb-6 text-[#0B1F5E] dark:text-blue-400 leading-tight">
								You&apos;re always welcome!
							</h1>

							<p className="text-[17px] leading-8 text-gray-600 dark:text-gray-300">
								Contact us for any kind of query, proposal, or
								agreement. We really look forward to hearing
								from you because, as we say, you are always
								welcome!
							</p>
						</div>

						<div>
							<h1 className="text-4xl font-bold mb-6 text-[#0B1F5E] dark:text-blue-400">
								Contact Info
							</h1>

							<div className="flex flex-col gap-5 text-gray-700 dark:text-gray-300 text-[17px]">
								<div className="leading-8">
									Dept. of BECM
									<br />
									RUET, Rajshahi, Bangladesh
								</div>

								<div>
									<span className="font-semibold">
										Phone:
									</span>{" "}
									+880-2588867429
								</div>

								<div>
									<span className="font-semibold">
										E-mail:
									</span>{" "}
									<a
										href="mailto:cc.becm.ruet@gmail.com"
										className="
											text-red-600
											font-semibold
											hover:text-red-700
											transition-colors
										"
									>
										cc.becm.ruet@gmail.com
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Contact Form */}
					<div className="lg:col-span-2 w-full h-full">
						<div
							className="
								w-full
								h-full
								bg-white
								dark:bg-gray-900
								border
								border-slate-200
								dark:border-gray-700
								rounded-3xl
								p-8
								shadow-[0_8px_30px_rgb(0,0,0,0.06)]
								flex
								flex-col
							"
						>
							{/* Title */}
							<h1 className="text-4xl font-bold mb-10 text-center text-[#0B1F5E] dark:text-blue-400">
								Get in touch
							</h1>

							<div className="flex-1">
								<ContactForm />
							</div>
						</div>
					</div>
				</div>

				{/* Map Section */}
				<div className="w-full mt-16">
					<div
						className="
							overflow-hidden
							rounded-3xl
							border
							border-slate-200
							dark:border-gray-700
							shadow-[0_8px_30px_rgb(0,0,0,0.06)]
						"
					>
						<iframe
							className="w-full h-[350px] sm:h-[450px]"
							src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7268.7857330440565!2d88.634951!3d24.367633!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbefd0a55ea957%3A0x2f9cac3357d62617!2sRajshahi%20University%20of%20Engineering%20%26%20Technology!5e0!3m2!1sen!2sbd!4v1708970104287!5m2!1sen!2sbd"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>
				</div>

				{/* Ad Banner */}
				{/* <div className="mt-14 flex justify-center">
					<AdsterraBanner
						adKey="23cf8dbb69977b0d73645731506658fb"
						width={728}
						height={90}
					/>
				</div> */}
			</div>
		</div>
	);
}