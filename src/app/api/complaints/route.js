import { NextResponse } from 'next/server';
export let complaints=[];
export async function GET(){ return NextResponse.json(complaints); }
export async function POST(req){
  const d=await req.json();
  complaints.push({id:Date.now(),...d,status:"pending",assignedTo:null});
  return NextResponse.json({ok:true});
}
