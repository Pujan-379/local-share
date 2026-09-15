'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import SharedNote from '@/components/SharedNote';
import FileModal from '@/components/FileModal';
import UploadModal from '@/components/UploadModal';

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121417]">
      <Navbar
        onUploadClick={() => setIsUploadOpen(true)}
        onDownloadClick={() => setIsDownloadOpen(true)}
      />

      <main className="max-w-2xl mx-auto p-4">
        <SharedNote />
      </main>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <FileModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        onUploadClick={() => {
          setIsDownloadOpen(false);
          setIsUploadOpen(true);
        }}
      />
    </div>
  );
}