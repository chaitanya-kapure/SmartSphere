import { NextResponse } from 'next/server';
import { complaints } from '../complaints/route';
export async function POST(req){
  const {id,image}=await req.json();
  const c=complaints.find(x=>x.id==id);
  if(c){c.status="done";c.workerProof=image;}
  return NextResponse.json({ok:true});
}
