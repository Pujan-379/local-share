import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getNetworkKeyFromRequest } from "@/lib/network";
import { randomUUID } from 'crypto';

export async function GET(request: Request) {

  const networkKey = getNetworkKeyFromRequest(request);

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("network_key", networkKey)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
export async function POST(request: Request) {
    
    const body = await request.json();
    const networkKey = getNetworkKeyFromRequest(request)
    const ownerToken = randomUUID();

    const { data, error } = await supabase
    .from('posts')
    .insert({
      network_key: networkKey,
      owner_token: ownerToken,
      type: body.type,
      content: body.content,
      file_name: body.file_name ?? null,
      file_size: body.file_size ?? null,
      mime_type: body.mime_type ?? null,
    })
    .select()
    .single();

     if (error) {
    return NextResponse.json({ error: error.message }, { status: 500});
  }

  return NextResponse.json(data);

}
