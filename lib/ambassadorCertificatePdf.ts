import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { formatParticipantName } from "@/lib/participantName";
import QRCode from "qrcode";
import sharp from "sharp";
import { createAmbassadorCertificateToken } from "@/lib/ambassadorCertificateVerification";

export type AmbassadorCertificatePerson = { code: string; name: string; email: string; university: string; department: string };

export async function createAmbassadorCertificatePdf(person: AmbassadorCertificatePerson, options: { protect?: boolean } = {}): Promise<Buffer> {
  const token=createAmbassadorCertificateToken(person.code);
  const origin=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.constructcarnival.com").replace(/\/$/,"");
  const verificationUrl=`${origin}/certificatteamb/verify?token=${encodeURIComponent(token)}`;
  const verificationQr=await QRCode.toBuffer(verificationUrl,{width:512,margin:4,errorCorrectionLevel:"H",color:{dark:"#000000",light:"#ffffff"}});
  const signaturePath1=join(process.cwd(),"public","images","Signature_1.png");
  const signaturePath2=join(process.cwd(),"public","images","signature.png");
  const signatureImage1=existsSync(signaturePath1)?await sharp(signaturePath1).trim().png().toBuffer():null;
  const signatureImage2=existsSync(signaturePath2)?await sharp(signaturePath2).trim().png().toBuffer():null;
  return new Promise((resolve, reject) => {
    const name = formatParticipantName(person.name);
    const document = new PDFDocument({
      size: "A4", layout: "landscape", margin: 0,
      ...(options.protect === false ? {} : { ownerPassword: randomBytes(32).toString("hex"), permissions: { modifying: false, annotating: false, fillingForms: false, documentAssembly: false, copying: true, contentAccessibility: true, printing: "highResolution" as const } }),
      info: { Title: `Certificate of Appreciation - ${name}`, Author: "Construct Carnival 2.0", Subject: `Campus Ambassador ${person.code}` },
    });
    const chunks: Buffer[] = [];
    document.on("data", chunk => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    const width=document.page.width,height=document.page.height;
    const navy="#0b2e3d",teal="#087f78",gold="#c69a42",cream="#fffaf0",muted="#53636a",nameGreen="#005c4b";
    const logo=join(process.cwd(),"public","logo","blue-main_x1024.png");
    const seal=join(process.cwd(),"public","logo","certificate_logo.png");
    const font=(...parts:string[])=>join(process.cwd(),"node_modules","@fontsource",...parts);
    document.registerFont("Inter",font("inter","files","inter-latin-400-normal.woff"));
    document.registerFont("Inter Bold",font("inter","files","inter-latin-700-normal.woff"));
    document.registerFont("Lora Bold",font("lora","files","lora-latin-700-normal.woff"));
    const script="C:\\Windows\\Fonts\\ITCEDSCR.TTF";
    document.registerFont("Script",existsSync(script)?script:font("great-vibes","files","great-vibes-latin-400-normal.woff"));

    const frameBlue = "#176f8f";
    document.rect(0,0,width,height).fill("#fffdf7");
    const frameOuter=16,frameInner=27;
    document.save().opacity(.035).strokeColor(frameBlue).lineWidth(.28);
    for(let x=frameOuter-70;x<=width-frameOuter;x+=5.6)document.moveTo(x,frameOuter).lineTo(x+70,height-frameOuter).stroke();
    document.restore();
    document.save().opacity(.025).strokeColor(frameBlue).lineWidth(.2);
    for(let x=frameOuter;x<=width-frameOuter;x+=16.8)document.moveTo(x,frameOuter).lineTo(x,height-frameOuter).stroke();
    for(let y=frameOuter;y<=height-frameOuter;y+=16.8)document.moveTo(frameOuter,y).lineTo(width-frameOuter,y).stroke();
    document.restore();
    document.rect(frameOuter,frameOuter,width-frameOuter*2,height-frameOuter*2).lineWidth(1.9).stroke(frameBlue);
    document.rect(frameInner,frameInner,width-frameInner*2,height-frameInner*2).lineWidth(.9).stroke(frameBlue);
    const drawFrameCorner=()=>{document.moveTo(16,53).lineTo(16,16).lineTo(53,16).moveTo(27,64).lineTo(27,27).lineTo(64,27).moveTo(40,16).lineTo(40,40).lineTo(16,40).lineWidth(1.9).stroke(frameBlue)};
    drawFrameCorner();
    document.save().translate(width,0).scale(-1,1);drawFrameCorner();document.restore();
    document.save().translate(0,height).scale(1,-1);drawFrameCorner();document.restore();
    document.save().translate(width,height).scale(-1,-1);drawFrameCorner();document.restore();

    document.save().lineWidth(1.4).fillColor("#ffffff").strokeColor("#d5ad5f").circle(width/2-70,76,22).fillAndStroke().restore();
    document.image(logo,width/2-87,59,{fit:[34,34]});
    document.moveTo(width/2-32,54).lineTo(width/2-32,98).lineWidth(1).stroke("#d2be8d");
    document.font("Inter Bold").fontSize(12).fillColor("#07989c").text("C O N S T R U C T",width/2-22,59,{width:180,align:"left"});
    document.fillColor("#f05a28").text("C A R N I V A L  ",width/2-22,77,{width:180,align:"left",continued:true});
    document.fillColor("#9c3fe4").text("2 . 0");
    const qrSize=88,qrX=width-139,qrY=35;
    document.save().roundedRect(qrX-3,qrY-3,qrSize+6,qrSize+6,3).fillAndStroke("#ffffff","#d5ad5f").restore();
    document.image(verificationQr,qrX,qrY,{width:qrSize,height:qrSize});

    document.font("Inter Bold").fontSize(13).fillColor(gold).text("C E R T I F I C A T E   O F",120,142,{width:width-240,align:"center"});
    document.font("Lora Bold").fontSize(48).fillColor(navy).text("Appreciation",100,166,{width:width-200,align:"center"});
    document.font("Inter").fontSize(15).fillColor(muted).text("Proudly presented to",130,241,{width:width-260,align:"center"});
    const size=name.length>28?36:name.length>20?42:48;
    document.font("Script").fontSize(size).fillColor(nameGreen).text(name,90,270,{width:width-180,align:"center"});
    document.moveTo(190,338).lineTo(width-190,338).lineWidth(1.4).stroke(gold);
    document.font("Inter").fontSize(12.5).fillColor(muted).text("in grateful recognition of outstanding leadership, dedicated service, and valuable contribution as a",105,357,{width:width-210,align:"center",lineGap:5});
    document.font("Inter Bold").fontSize(18).fillColor(nameGreen).text("CAMPUS AMBASSADOR",105,397,{width:width-210,align:"center",characterSpacing:1.5});
    document.font("Inter").fontSize(11.5).fillColor(muted).text("Your commitment to outreach and community building helped make Construct Carnival 2.0 a meaningful platform for future professionals.",115,451,{width:width-230,align:"center",lineGap:4});

    const left=width/4,right=width*3/4;
    if(signatureImage1)document.image(signatureImage1,left-55,500,{fit:[110,34],align:"center",valign:"center"});
    if(signatureImage2)document.image(signatureImage2,right-55,500,{fit:[110,34],align:"center",valign:"center"});
    document.moveTo(left-65,538).lineTo(left+65,538).stroke(gold).moveTo(right-65,538).lineTo(right+65,538).stroke(gold);
    document.font("Inter Bold").fontSize(9).fillColor(navy).text("EVENT COORDINATOR",left-80,546,{width:160,align:"center"}).text("HEAD, DEPT. OF BECM",right-80,546,{width:160,align:"center"});
    if(existsSync(seal))document.image(seal,width/2-35,500,{fit:[70,70]});
    document.end();
  });
}
