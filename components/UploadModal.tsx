'use client';

import { useRef, useState, useEffect } from 'react';
import { uploadFile } from '@/lib/upload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      await uploadFile(file);
      setUploading(false);
      onClose();
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  }

  function handleBrowseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  // Paste-to-upload: listen for a global paste event while this modal is open
  useEffect(() => {
    if (!isOpen) return;

    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#121417]/95 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-[#1A1D22] border border-[#2A2D33] rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-[#E8E6E1] text-xl font-semibold">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-[#8A8F98] hover:text-[#E8E6E1] text-xl leading-none"
          >
            ×
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleBrowseChange}
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-5 border-2 border-dashed rounded-xl py-8 sm:py-12 flex items-center justify-center text-center transition-colors ${
            isDragging ? 'border-[#4ADE80] bg-[#4ADE80]/5' : 'border-[#2A2D33]'
          }`}
        >
          <p className="text-[#8A8F98]">
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                Drag & Drop your files or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#4ADE80] underline underline-offset-2"
                >
                  Browse
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-4 text-sm text-[#5A5F68]">
          Tip: press ⌘V to paste a file or image and upload it instantly.
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}