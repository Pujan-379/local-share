"use client";
import { supabase } from "@/lib/db";
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
export default function SharedNote() {
  const [text, setText] = useState("");

  // Load existing note content on mount
  useEffect(() => {
    async function loadShared() {
      const res = await fetch("/api/posts");
      const data: Post[] = await res.json();
      const existing = data.find((post) => post.type === "text");
      if (existing) setText(existing.content);
    }
    loadShared();
  }, []);

  // 2. Debounced auto-save whenever `text` changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", content: text }),
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [text]);

  // Realtime: listen for changes to the text post from OTHER tabs/devices
  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          if (payload.new && (payload.new as any).type === "text") {
            setText((payload.new as any).content);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Share something with this network..."
    />
  );
}
