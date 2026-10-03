import {timingSafeEqual} from "node:crypto";
import {db,sql} from "@vercel/postgres";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
const PASSWORD=process.env.ADMIN_PASSWORD||"";
function valid(value:unknown){if(!PASSWORD||typeof value!=="string")return false;const a=Buffer.from(value),b=Buffer.from(PASSWORD);return a.length===b.length&&timingSafeEqual(a,b)}
async function schema(){await sql`CREATE TABLE IF NOT EXISTS trussLoadingSetup(id INTEGER PRIMARY KEY CHECK(id BETWEEN 1 AND 4),name TEXT NOT NULL,weight_kg NUMERIC(12,3) NOT NULL CHECK(weight_kg>0),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;await sql`INSERT INTO trussLoadingSetup(id,name,weight_kg)VALUES(1,'Setup-01',6),(2,'Setup-02',6),(3,'Setup-03',6),(4,'Setup-04',6)ON CONFLICT(id)DO NOTHING`}
async function data(){const [s,r]=await Promise.all([sql`SELECT id,name,weight_kg FROM trussLoadingSetup ORDER BY id`,sql`SELECT registration_id,team_name,truss_weight_grams,setup_number,added_load_kg FROM trussLoadingResult ORDER BY registration_id`]);const setups=s.rows.map(x=>({id:Number(x.id),name:x.name,weightKg:Number(x.weight_kg)}));return{setups,results:r.rows.map(x=>{const setup=setups.find(y=>y.id===Number(x.setup_number)),grams=x.truss_weight_grams==null?null:Number(x.truss_weight_grams),added=x.added_load_kg==null?null:Number(x.added_load_kg),applied=setup&&added!=null?setup.weightKg+added:null,efficiency=applied!=null&&grams?Number((applied/(grams/1000)).toFixed(8)):null;return{registrationId:Number(x.registration_id),teamName:x.team_name,trussWeightGrams:grams,setupNumber:x.setup_number==null?null:Number(x.setup_number),addedLoadKg:added,appliedLoadKg:applied,efficiency}})}}
export async function POST(req:Request){
 try{
  const b=await req.json();
  if(!valid(b.password))return NextResponse.json({message:"Incorrect password."},{status:401});
  await schema();
  if(b.action==="save-setups"){
   if(!Array.isArray(b.setups)||b.setups.length!==4)return NextResponse.json({message:"All four setup weights are required."},{status:400});
   const weights=[];
   for(let id=1;id<=4;id++){
    const matches=b.setups.filter((x:{id:number})=>Number(x.id)===id),weight=Number(matches[0]?.weightKg);
    if(matches.length!==1||!Number.isFinite(weight)||weight<.001)return NextResponse.json({message:"Every setup needs a unique ID and a weight of at least 0.001 kg."},{status:400});
    weights.push(Number(weight.toFixed(3)));
   }
   const client=await db.connect();
   try{
    await client.sql`BEGIN`;
    for(let id=1;id<=4;id++){
     const saved=await client.sql`UPDATE trussLoadingSetup SET weight_kg=${weights[id-1]},updated_at=NOW() WHERE id=${id} RETURNING weight_kg`;
     if(saved.rowCount!==1||Number(saved.rows[0].weight_kg)!==weights[id-1])throw Error("The database did not save the requested setup weight.");
    }
    await client.sql`COMMIT`;
   }catch(e){await client.sql`ROLLBACK`;throw e}finally{client.release()}
  }else if(b.action==="save-result"){
   const id=Number(b.registrationId),grams=Number(b.trussWeightGrams),setup=Number(b.setupNumber),load=Number(b.addedLoadKg);
   if(!Number.isInteger(id)||id<=0||b.trussWeightGrams==null||!Number.isFinite(grams)||grams<.001||!Number.isInteger(setup)||setup<1||setup>4||b.addedLoadKg==null||!Number.isFinite(load)||load<0)return NextResponse.json({message:"Enter valid result values."},{status:400});
   const savedGrams=Number(grams.toFixed(3)),savedLoad=Number(load.toFixed(3));
   const q=await sql`UPDATE trussLoadingResult SET truss_weight_grams=${savedGrams},setup_number=${setup},added_load_kg=${savedLoad},weight_updated_at=NOW(),load_updated_at=NOW(),updated_at=NOW() WHERE registration_id=${id} RETURNING truss_weight_grams,setup_number,added_load_kg`;
   if(!q.rowCount)return NextResponse.json({message:"Result row was not found."},{status:404});
   const row=q.rows[0];
   if(Number(row.truss_weight_grams)!==savedGrams||Number(row.setup_number)!==setup||Number(row.added_load_kg)!==savedLoad)throw Error("The database did not save the requested result.");
  }else if(b.action!=="load")return NextResponse.json({message:"Invalid admin action."},{status:400});
  return NextResponse.json({success:true,...await data()},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("LOADING ADMIN ERROR:",e);return NextResponse.json({message:"Unable to save loading changes to the database. Please try again."},{status:500})}
}
