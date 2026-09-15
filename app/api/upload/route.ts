import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { getNetworkKeyFromRequest } from "@/lib/network";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large — max size is 25 MB" },
      { status: 400 },
    );
  }

  const networkKey = getNetworkKeyFromRequest(request);

  // unique storage path so multiple uploads never collide
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filePath = `${networkKey}/${Date.now()}-${safeName}`;

  // raw file bytes to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // public URL for the file we just uploaded
  const { data: urlData } = supabase.storage
    .from("files")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      network_key: networkKey,
      type: "file",
      content: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
