import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ambassadors } from "@/lib/ambassadors";
import { createAmbassadorCertificatePdf } from "@/lib/ambassadorCertificatePdf";
function auth(value:unknown){const p=Buffer.from(typeof value==="string"?value.replace(/\s+/g,""):""),e=Buffer.from((process.env.ADMIN_PASSWORD||"").replace(/\s+/g,""));return Boolean(process.env.ADMIN_PASSWORD)&&p.length===e.length&&timingSafeEqual(p,e)}
export async function POST(request:Request){
  try{const {password,code}=await request.json();if(!auth(password))return NextResponse.json({message:"Unauthorized"},{status:401});const person=ambassadors.find(item=>item.code===code);if(!person)return NextResponse.json({message:"Campus ambassador not found."},{status:404});const pdf=await createAmbassadorCertificatePdf(person,{protect:false});return new NextResponse(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename=${person.code}-ambassador-certificate.pdf`,"Cache-Control":"no-store"}})
  }catch(error){console.error("AMBASSADOR CERTIFICATE PREVIEW:",error);return NextResponse.json({message:"Unable to generate certificate."},{status:500})}
}
