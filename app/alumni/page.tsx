import RegistrationPage from '@/components/alumni_reg'
import paymentBySSL from '@/components/payments/ssl';
import { siteConfig } from '@/config/site';
import { sql } from '@vercel/postgres';
import generateUniqueId from 'generate-unique-id';

import React from 'react'
import Marquee from 'react-fast-marquee';

const handleSubmission = async (formData: any) => {
	"use server";
	let lastId = 1000;
	let userId = lastId;

	try {
		const result = await sql`SELECT id FROM alumniData ORDER BY id DESC LIMIT 1`;
		userId = result.rows[0]?.id + 1;
		console.log("User ID: ", userId)
	} catch (error) {
		console.error("SQL error:", error);
	}

	try {
		const _tran_id = generateUniqueId({
			length: 12,
			useLetters: false
		});

		const tran_id = 'BECMCC' + siteConfig.serial.replace('.', '') + '-' + userId + '-' + _tran_id

		await sql`INSERT INTO alumniData (id,name,rollno,phonenumber,email,currentposition,affiliation,company,programname,university,country,fee,ispaid,tran_id) 
      				VALUES (${userId}, ${formData.name}, ${formData.roll}, ${formData.phoneNumber}, ${formData.email}, ${formData.type}, ${formData.affiliation}, ${formData.company}, ${formData.programeName}, ${formData.university}, ${formData.country}, ${formData.fee}, FALSE, ${tran_id})`;
		console.log("Form submitted");
		const { status, message, data } = await paymentBySSL({
			userId: userId,
			tran_id: tran_id,
			...formData
		});

		if (status === 200) {
			return {
				status: 200,
				message: "Success",
				url: data.GatewayPageURL,
			};
		}
	} catch (error) {
		console.error("SQL error occurred while sending data.");
		console.log(error)
	}
	return {
		status: 500,
		message: "Internal Server Error",
		url: "",
	};
}

export default function page() {
	return (
		// <RegistrationPage handleSubmission={handleSubmission} />
		<Marquee className="py-10" gradient={false} gradientColor="white" speed={100} pauseOnHover>
			<p
				className="text-2xl font-bold text-center text-rose-600"
			>
				Registration Process has been Closed!
			</p>
		</Marquee>
	)
}
