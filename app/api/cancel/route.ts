import { NextResponse } from "next/server";

// HANDLE POST FROM SSLCOMMERZ
export async function POST(request: Request) {

    try {

        const formData = await request.formData();

        const tran_id =
            formData.get("tran_id") as string;

        const status =
            formData.get("status") as string;

        console.log(
            "SSL PAYMENT CANCELLED:",
            {
                tran_id,
                status,
            }
        );

        const redirectUrl =
            new URL(
                `/cancel?tran_id=${tran_id || ""}&status=${status || "CANCELLED"}`,
                "https://constructcarnival.com"
            );

        return NextResponse.redirect(
            redirectUrl,
            { status: 303 }
        );

    } catch (error: any) {

        console.error(
            "CANCEL ROUTE ERROR:",
            error?.message || error
        );

        return NextResponse.redirect(
            new URL(
                "/cancel",
                "https://constructcarnival.com"
            ),
            { status: 303 }
        );
    }
}

// HANDLE GET REQUEST
export async function GET(request: Request) {

    try {

        const { searchParams } =
            new URL(request.url);

        const tran_id =
            searchParams.get("tran_id");

        const status =
            searchParams.get("status");

        const redirectUrl =
            new URL(
                `/cancel?tran_id=${tran_id || ""}&status=${status || "CANCELLED"}`,
                "https://constructcarnival.com"
            );

        return NextResponse.redirect(
            redirectUrl,
            { status: 303 }
        );

    } catch (error: any) {

        console.error(
            "CANCEL GET ERROR:",
            error?.message || error
        );

        return NextResponse.redirect(
            new URL(
                "/cancel",
                "https://constructcarnival.com"
            ),
            { status: 303 }
        );
    }
}