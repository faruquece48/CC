"use server";

import { sql } from "@vercel/postgres";
import paymentBySSL from "@/components/payments/ssl";
import generateUniqueId from "generate-unique-id";

export async function handleSupport(formData: FormData) {

  // GET VALUES
  const name =
    formData.get("name")?.toString() || "";

  const email =
    formData.get("email")?.toString() || "";

  const phone =
    formData.get("phone")?.toString() || "";

  const amount = Number(
    formData.get("amount")
  );

  const company_name =
    formData.get("company_name")?.toString() || "";

  // GENERATE ID
  const supportId = generateUniqueId({
    length: 10,
    useLetters: false,
  });

  const tran_id =
    "SUPPORT-" + supportId;

  // SAVE DATABASE
  try {

    await sql`
      INSERT INTO supportData
      (
        name,
        email,
        phone,
        company_name,
        amount,
        tran_id,
        ispaid
      )
      VALUES
      (
        ${name},
        ${email},
        ${phone},
        ${company_name},
        ${amount},
        ${tran_id},
        false
      )
    `;

  } catch (dbError) {

    console.error(
      "DB INSERT ERROR:",
      dbError
    );

    return {
      success: false,
      url: "",
      error: "Database error"
    };
  }

  // SSL PAYMENT
  try {

    const sslResponse =
      await paymentBySSL({

        userId: supportId,

        tran_id: tran_id,

        member1: name,

        member2: "",

        email: email,

        phoneNumber: phone,

        department: "Support",

        university:
          "Construct Carnival",

        criteria:
          "Support Contribution",

        fee: amount,

        isTeamSelected: false,

        teamName: "",

      });

    // DEBUG
    console.log(
      "SSL FULL RESPONSE:",
      JSON.stringify(
        sslResponse,
        null,
        2
      )
    );

    // GET PAYMENT URL
    const gatewayURL =
      sslResponse?.data?.GatewayPageURL ||
      sslResponse?.data?.redirectGatewayURL;

    // SUCCESS
    if (gatewayURL) {

      return {
        success: true,
        url: gatewayURL
      };
    }

    // NO URL FOUND
    console.error(
      "No GatewayPageURL found.",
      sslResponse
    );

    return {
      success: false,
      url: "",
      error:
        "No gateway URL in SSL response"
    };

  } catch (sslError) {

    console.error(
      "SSL ERROR:",
      sslError
    );

    return {
      success: false,
      url: "",
      error: String(sslError)
    };
  }
}