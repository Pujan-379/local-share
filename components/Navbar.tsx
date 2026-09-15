'use client';

import { useState } from 'react';
import { Copy, Upload, Download, Check } from 'lucide-react';

interface NavbarProps {
  onUploadClick: () => void;
  onDownloadClick: () => void;
}

export default function Navbar({ onUploadClick, onDownloadClick }: NavbarProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const res = await fetch('/api/posts');
    const data = await res.json();
    const existing = data.find((post: any) => post.type === 'text');

    await navigator.clipboard.writeText(existing?.content ?? '');

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <nav className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[#2A2D33]">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="relative flex w-2 h-2 flex-shrink-0">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[#4ADE80] opacity-75 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4ADE80]" />
          </span>
          <span className="text-sm text-[#E8E6E1] whitespace-nowrap">On this network</span>
        </div>
        <span className="hidden sm:block text-xs text-[#5A5F68] pl-4">
          Anything shared here stays on this Wi-Fi
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-md border border-[#2A2D33] text-[#E8E6E1] hover:border-[#4ADE80] transition-colors"
        >
          {copied ? (
            <Check size={15} className="text-[#4ADE80]" />
          ) : (
            <Copy size={15} />
          )}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-md border border-[#2A2D33] text-[#E8E6E1] hover:border-[#4ADE80] transition-colors"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Upload</span>
        </button>
        <button
          onClick={onDownloadClick}
          className="flex items-center gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-md border border-[#2A2D33] text-[#E8E6E1] hover:border-[#4ADE80] transition-colors"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </nav>
  );
}