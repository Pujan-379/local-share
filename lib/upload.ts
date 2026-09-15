const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function uploadFile(file: File): Promise<void> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large — max size is 25 MB');
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Upload failed');
  }
}