import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {

        // SSLCommerz sends form-data
        const formData = await request.formData();

        const tran_id = formData.get("tran_id") as string;
        const status = formData.get("status") as string;
        const error = formData.get("error") as string;

        console.log("SSL FAIL CALLBACK:", {
            tran_id,
            status,
            error,
        });

        // Redirect URL
        const failUrl = new URL(
            "https://constructcarnival.com/fail"
        );

        // Add transaction ID if exists
        if (tran_id) {
            failUrl.searchParams.set(
                "tran_id",
                tran_id
            );
        }

        // Add status if exists
        if (status) {
            failUrl.searchParams.set(
                "status",
                status
            );
        }

        return NextResponse.redirect(failUrl);

    } catch (err: any) {

        console.log(
            "FAIL ROUTE ERROR:",
            err?.message || err
        );

        return NextResponse.redirect(
            "https://constructcarnival.com/fail"
        );
    }
}