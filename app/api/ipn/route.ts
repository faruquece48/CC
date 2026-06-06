import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;

const is_live = true;

export async function POST(request: Request) {

    try {

        // SSLCommerz sends form-data
        const formData = await request.formData();

        const tran_id = formData.get("tran_id")?.toString();
        const val_id = formData.get("val_id")?.toString();
        const amount = formData.get("amount")?.toString();
        const currency = formData.get("currency")?.toString();

        console.log("IPN RECEIVED:", {
            tran_id,
            val_id,
            amount,
            currency,
        });

        // Validation URL
        const VALIDATION_URL = is_live
            ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
            : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

        // Validate payment with SSLCommerz
        const validationResponse = await fetch(
            `${VALIDATION_URL}?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`
        );

        const validation = await validationResponse.json();

        console.log("SSL VALIDATION RESPONSE:", validation);

        /**
         * PAYMENT VALIDATION CHECK
         */
        if (
            (
                validation.status !== "VALID" &&
                validation.status !== "VALIDATED"
            ) ||
            validation.tran_id !== tran_id
        ) {

            console.error("Payment validation failed.");

            return NextResponse.json(
                {
                    status: 400,
                    message: "Payment validation failed",
                },
                { status: 400 }
            );
        }

        console.log("Payment validation success.");

        /**
         * UPDATE DATABASE
         */
        try {

            const id_splits = tran_id?.split("-");
            const userID = Number(id_splits?.at(1));

            if (userID > 1700) {

                await sql`
                    UPDATE alumniData
                    SET ispaid = TRUE
                    WHERE tran_id = ${tran_id}
                `;

            } else {

                await sql`
                    UPDATE registrationData
                    SET ispaid = TRUE
                    WHERE tran_id = ${tran_id}
                `;
            }

            console.log("Database updated successfully.");

        } catch (sqlError) {

            console.error("SQL UPDATE ERROR:", sqlError);

            return NextResponse.json(
                {
                    status: 500,
                    message: "Database update failed",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                status: 200,
                message: "Payment successful",
            },
            { status: 200 }
        );

    } catch (error: any) {

        console.error(
            "IPN ERROR:",
            error?.message || error
        );

        return NextResponse.json(
            {
                status: 500,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}