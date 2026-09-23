import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ambassadors } from "@/lib/ambassadors";
function auth(value:unknown){const p=Buffer.from(typeof value==="string"?value.replace(/\s+/g,""):""),e=Buffer.from((process.env.ADMIN_PASSWORD||"").replace(/\s+/g,""));return Boolean(process.env.ADMIN_PASSWORD)&&p.length===e.length&&timingSafeEqual(p,e)}
export async function POST(request:Request){
  try{const {password}=await request.json();if(!auth(password))return NextResponse.json({message:"Unauthorized"},{status:401});
    await sql`CREATE TABLE IF NOT EXISTS ambassadorCertificateEmailLog (ambassador_code TEXT PRIMARY KEY, recipient TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sending', sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    const logs=await sql`SELECT ambassador_code,status,sent_at FROM ambassadorCertificateEmailLog`;
    const byCode=new Map(logs.rows.map(row=>[row.ambassador_code,row]));
    return NextResponse.json({success:true,ambassadors:ambassadors.map(person=>({...person,certificate_sent:byCode.get(person.code)?.status==="sent",certificate_sent_at:byCode.get(person.code)?.sent_at||null}))},{headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("AMBASSADOR CERTIFICATE LIST:",error);return NextResponse.json({message:"Unable to load campus ambassadors."},{status:500})}
}
