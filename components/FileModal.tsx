'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  FileText,
  FileArchive,
  FileAudio,
  FileVideo,
  File as FileIcon,
} from 'lucide-react';
import { Post } from '@/types/post';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadClick: () => void;
}

// Picks an icon component based on the file's mime type
function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileIcon;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) {
    return FileText;
  }
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) {
    return FileArchive;
  }
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.startsWith('video/')) return FileVideo;
  return FileIcon;
}

export default function FileModal({ isOpen, onClose, onUploadClick }: FileModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    async function loadPosts() {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
      setIsLoading(false);
    }
    loadPosts();
  }, [isOpen]);

  async function handleDownload(url: string, fileName: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(blobUrl);
  }

  async function handleDelete(id: string, fileName: string | null) {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      setToastMessage(`Couldn't delete ${fileName ?? 'file'} — try again`);
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== id));
    setToastMessage(`Deleted ${fileName ?? 'file'}`);
    setTimeout(() => setToastMessage(null), 2000);
  }

  if (!isOpen) return null;

  const filePosts = posts.filter((post) => post.type === 'file');

  return (
    <div className="fixed inset-0 bg-[#121417]/95 flex items-start justify-center pt-10 sm:pt-20 px-4 z-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#E8E6E1] text-base font-medium">Files on this network</h2>
          <button
            onClick={onClose}
            className="text-[#8A8F98] hover:text-[#E8E6E1] text-sm"
          >
            Close
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="text-[#5A5F68] animate-spin" />
          </div>
        )}

        {!isLoading && filePosts.length === 0 && (
          <div className="text-center py-6">
            <p className="text-[#8A8F98] text-sm mb-4">
              Nothing here yet.
            </p>
            <button
              onClick={onUploadClick}
              className="text-sm px-4 py-2 rounded-md border border-[#2A2D33] text-[#4ADE80] hover:border-[#4ADE80] transition-colors"
            >
              Upload a file
            </button>
          </div>
        )}

        {!isLoading && filePosts.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {filePosts.map((post) => {
              const isImage = post.mime_type?.startsWith('image/');
              const Icon = getFileIcon(post.mime_type);
              const sizeLabel = post.file_size
                ? post.file_size > 1024 * 1024
                  ? `${(post.file_size / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.max(1, Math.round(post.file_size / 1024))} KB`
                : '';

              return (
                <div
                  key={post.id}
                  className="flex items-center gap-3 bg-[#2A2D33] rounded-lg px-3 py-2.5"
                >
                  {isImage ? (
                    <img
                      src={post.content}
                      alt={post.file_name ?? 'uploaded file'}
                      onClick={() => setPreviewImage(post.content)}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-[#121417] cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-[#121417] flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-[#5A5F68]" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[#E8E6E1] text-sm truncate">{post.file_name}</p>
                    {sizeLabel && (
                      <p className="text-[#5A5F68] text-xs mt-0.5">{sizeLabel}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(post.content, post.file_name ?? 'download')}
                      className="text-[#4ADE80] text-sm hover:underline"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.file_name)}
                      className="text-[#8A8F98] hover:text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2A2D33] border border-[#3A3D43] text-[#E8E6E1] text-sm px-4 py-2 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60] cursor-zoom-out"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}