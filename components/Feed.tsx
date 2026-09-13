"use client";
import { useEffect, useState } from "react";
import { Post } from "@/types/post";
export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    async function loadPosts() {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    }
    loadPosts();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
