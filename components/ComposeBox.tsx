"use client";

import { useState } from "react";

export default function ComposeBox() {
  const [text, setText] = useState("");

  async function handleSubmit() {
    if (!text.trim()) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", content: text }),
    });
    if (res.ok) {
      setText("");
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share something with this network..."
      />
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
}
