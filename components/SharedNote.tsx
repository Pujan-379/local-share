'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/db';

export default function SharedNote() {
  const [text, setText] = useState('');
  const [justUpdated, setJustUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const textRef = useRef(text);

  // Keep a ref in sync with the latest text, so the realtime
  // callback (set up once on mount) can always see the current value
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    async function loadShared() {
      const res = await fetch('/api/posts');
      const data = await res.json();
      const existing = data.find((post: any) => post.type === 'text');
      if (existing) setText(existing.content);
      setIsLoading(false);
    }
    loadShared();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: text }),
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.new && (payload.new as any).type === 'text') {
            const newContent = (payload.new as any).content;

            // Only treat this as a "remote" update (and pulse) if it's
            // actually different from what's already on screen
            if (newContent !== textRef.current) {
              setText(newContent);
              setJustUpdated(true);
              setTimeout(() => setJustUpdated(false), 700);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={20} className="text-[#5A5F68] animate-spin" />
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing..."
        className={`w-full min-h-[60vh] sm:min-h-[70vh] bg-[#1A1D22] text-[#E8E6E1] placeholder-[#5A5F68]
                   rounded-xl border outline-none p-4 sm:p-5 text-base leading-relaxed resize-none
                   transition-all duration-700
                   ${isLoading ? 'opacity-0' : 'opacity-100'}
                   ${
                     justUpdated
                       ? 'border-[#4ADE80] shadow-[0_0_0_3px_rgba(74,222,128,0.15)]'
                       : 'border-[#2A2D33] focus:border-[#4ADE80]'
                   }`}
      />
    </div>
  );
}