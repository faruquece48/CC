import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {

    try {

        const result = await sql`
            SELECT NOW()
        `;

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.log(error);

        return NextResponse.json({
            success: false,
            error
        });
    }
}