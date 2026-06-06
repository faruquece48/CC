import axios from "axios";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = true;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const val_id = formData.get("val_id") as string;
        const tran_id = formData.get("tran_id") as string;

        console.log("SSL Success Callback:", { val_id, tran_id });

        if (!val_id) {
            return NextResponse.redirect(
                "https://constructcarnival.com/fail",
                { status: 303 }
            );
        }

        const VALIDATION_URL = is_live
            ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
            : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

        const validationResponse = await axios.get(
            `${VALIDATION_URL}?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`
        );

        const data = validationResponse.data;
        console.log("SSL Validation Response:", data);

        if (data.status === "VALID" || data.status === "VALIDATED") {

            // SUPPORT PAYMENT
            if (tran_id.startsWith("SUPPORT-")) {
                await sql`
                    UPDATE supportData
                    SET ispaid = true
                    WHERE tran_id = ${tran_id}
                `;
                console.log("Support payment marked paid:", tran_id);

            // REGISTRATION PAYMENT
            } else {
                await sql`
                    UPDATE registrationData
                    SET ispaid = true
                    WHERE tran_id = ${tran_id}
                `;
                console.log("Registration payment marked paid:", tran_id);
            }

            const successUrl = new URL("https://constructcarnival.com/success");
            successUrl.searchParams.set("tran_id", tran_id);
            return NextResponse.redirect(successUrl, { status: 303 });
        }

        return NextResponse.redirect(
            "https://constructcarnival.com/fail",
            { status: 303 }
        );

    } catch (error: any) {
        console.log("SSL SUCCESS ROUTE ERROR:", error.response?.data || error.message);
        return NextResponse.redirect(
            "https://constructcarnival.com/fail",
            { status: 303 }
        );
    }
}