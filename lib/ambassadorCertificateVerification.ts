import { createHmac, timingSafeEqual } from "node:crypto";
function secret(){const value=process.env.CERTIFICATE_SECRET||process.env.QR_CODE_SECRET||process.env.ADMIN_PASSWORD;if(!value&&process.env.NODE_ENV!=="development")throw new Error("Certificate verification secret is not configured.");return value||"local-certificate-secret"}
function signature(value:string){return createHmac("sha256",secret()).update(value).digest().subarray(0,12).toString("base64url")}
export function createAmbassadorCertificateToken(code:string){return `${code}.${signature(code)}`}
export function verifyAmbassadorCertificateToken(token:string){const [code,supplied,extra]=token.split(".");if(!/^CC\d{2}$/.test(code||"")||!supplied||extra)return null;const expected=signature(code);const a=Buffer.from(supplied),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)?{code}:null}
