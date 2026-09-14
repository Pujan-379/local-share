'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/post';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadPosts() {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    }
    loadPosts();
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }

  const filePosts = posts.filter((post) => post.type === 'file');

  return (
    <div>
      {filePosts.map((post) => {
        const isImage = post.mime_type?.startsWith('image/');

        return (
          <div key={post.id}>
            {isImage ? (
              <img src={post.content} alt={post.file_name ?? 'uploaded file'} width={150} />
            ) : (
              <p>{post.file_name}</p>
            )}
            <a href={post.content} download={post.file_name}>Download</a>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          </div>
        );
      })}
    </div>
  );
}