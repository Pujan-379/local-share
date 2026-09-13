import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getNetworkKeyFromRequest } from "@/lib/network";

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
  const networkKey = getNetworkKeyFromRequest(request);

  // Text: one row per network, update if it exists, insert if not
  if (body.type === 'text') {
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('network_key', networkKey)
      .eq('type', 'text')
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('posts')
        .update({
          content: body.content,
          created_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        network_key: networkKey,
        type: 'text',
        content: body.content,
        file_name: null,
        file_size: null,
        mime_type: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }


  const { data, error } = await supabase
    .from('posts')
    .insert({
      network_key: networkKey,
      type: 'file',
      content: body.content,
      file_name: body.file_name ?? null,
      file_size: body.file_size ?? null,
      mime_type: body.mime_type ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}