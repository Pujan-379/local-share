"use client";

export default function ComposeBox() {
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data); // temporary: so we can see success or error in the browser console
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
