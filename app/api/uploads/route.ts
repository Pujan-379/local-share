import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getNetworkKeyFromRequest } from '@/lib/network';

export async function POST(request: Request) {
  const formData = await request.formData(); 
  const file = formData.get('file') as File; 

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const networkKey = getNetworkKeyFromRequest(request);

  //  unique storage path so multiple uploads never collide
  const filePath = `${networkKey}/${Date.now()}-${file.name}`;

  //  raw file bytes to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('files')
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  //  public URL for the file we just uploaded
  const { data: urlData } = supabase.storage
    .from('files')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      network_key: networkKey,
      type: 'file',
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