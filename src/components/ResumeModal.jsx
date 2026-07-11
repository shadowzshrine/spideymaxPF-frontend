"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Folder, 
  File, 
  Download, 
  ChevronRight, 
  ChevronDown, 
  Maximize2,
  Loader, 
  AlertCircle 
} from 'lucide-react';
import SpiderWebLoader from './SpiderWebLoader.jsx';
import { playPopupClose, playSuccess } from '@/utils/audio';

const FolderNode = ({ node, level = 0, onSelectFile, selectedFileId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';

  if (isFolder) {
    return (
      <div className="space-y-1">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          className="w-full flex items-center space-x-2 py-2 px-2 hover:bg-zinc-900/60 rounded-lg text-left text-zinc-300 hover:text-white transition-colors text-xs font-mono select-none"
        >
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
          <Folder className="w-3.5 h-3.5 text-spidey-blue-glow fill-spidey-blue-glow/10" />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children && (
          <div className="space-y-1">
            {node.children.map(child => (
              <FolderNode 
                key={child.id} 
                node={child} 
                level={level + 1} 
                onSelectFile={onSelectFile}
                selectedFileId={selectedFileId}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    const isSelected = selectedFileId === node.id;
    return (
      <button
        onClick={() => onSelectFile(node)}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        className={`w-full flex items-center space-x-2 py-1.5 px-2 rounded-lg text-left transition-all text-xs font-mono ${
          isSelected 
            ? 'bg-spidey-red/10 border border-spidey-red/25 text-white shadow-[0_0_10px_rgba(229,9,20,0.15)]' 
            : 'hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 border border-transparent'
        }`}
      >
        <File className={`w-3.5 h-3.5 ${isSelected ? 'text-spidey-red' : 'text-zinc-500'}`} />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
};

export default function ResumeModal({ contact, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Helper to extract file ID from URL if needed
  const getFileIdFromUrl = (url) => {
    if (!url) return '';
    const match = /id=([a-zA-Z0-9_-]{28,})/.exec(url);
    if (match) return match[1];
    const viewMatch = /file\/d\/([a-zA-Z0-9_-]{28,})/.exec(url);
    if (viewMatch) return viewMatch[1];
    return '';
  };

  // Build the tree structures
  const tree = contact?.resumeTree && contact.resumeTree.length > 0
    ? contact.resumeTree
    : [
        {
          id: getFileIdFromUrl(contact?.resumeUrl) || '1T6UZiZUByzGBk0fBXDecv__P2m_PLU4l',
          name: 'Mageswaran_Resume.pdf',
          type: 'file',
          mimeType: 'application/pdf'
        }
      ];

  // Set the first file found in the tree as active by default
  useEffect(() => {
    const findFirstFile = (nodes) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          setSelectedFile(node);
          return true;
        }
        if (node.children && findFirstFile(node.children)) {
          return true;
        }
      }
      return false;
    };
    findFirstFile(tree);
  }, [contact]);

  // Restart iframe loading spinner when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setIframeLoading(true);
    }
  }, [selectedFile]);

  if (!selectedFile) return null;

  const previewUrl = `https://drive.google.com/file/d/${selectedFile.id}/preview`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${selectedFile.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm pointer-events-auto">
      {/* Click outside to close overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => { playPopupClose(); onClose(); }} />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 15, y: 40 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, rotateX: -10, y: 25 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1200 }}
        className="relative w-full max-w-5xl h-[85vh] bg-[#0a0a0f] border border-zinc-850 rounded-3xl overflow-hidden card-grid flex flex-col md:flex-row shadow-[0_0_50px_rgba(229,9,20,0.15)] z-10"
      >
        {/* LEFT PANEL: Document Tree Explorer (Width: 35%) */}
        <div className="w-full md:w-[35%] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 bg-[#08080c]/95 z-10">
          <div className="space-y-5 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
              <div>
                <span className="font-mono text-[9px] text-spidey-red bg-spidey-red/10 border border-spidey-red/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  CV HUB
                </span>
                <h2 className="text-lg md:text-xl font-heading text-white spidey-heading uppercase tracking-tight mt-2">
                  Documents Explorer
                </h2>
              </div>
              <button 
                onClick={() => { playPopupClose(); onClose(); }}
                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-spidey-red/10 border border-zinc-900 hover:border-spidey-red/30 text-zinc-500 hover:text-spidey-red cursor-pointer transition-all md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tree Section */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2">
              <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-2">// DIRECTORIES_ROOT</span>
              <div className="space-y-1">
                {tree.map(node => (
                  <FolderNode 
                    key={node.id} 
                    node={node} 
                    onSelectFile={setSelectedFile}
                    selectedFileId={selectedFile.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 mt-4 border-t border-zinc-950 flex flex-col gap-2 font-mono text-[10px] text-zinc-500">
            <span className="truncate block">// ACTIVE_FILE: {selectedFile.name}</span>
            <span className="block">// SOURCE: GOOGLE_DRIVE_SERVER</span>
          </div>
        </div>

        {/* RIGHT PANEL: Live Document Viewer (Width: 65%) */}
        <div className="w-full md:w-[65%] h-full relative bg-[#040406]">
          {/* Topbar Utility Icons Overlay */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            {/* Direct Download Action */}
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Download Current PDF"
              className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Open Direct Viewer Link */}
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open View Mode in New Tab"
              className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <Maximize2 className="w-4 h-4" />
            </a>

            {/* Close Modal (Desktop) */}
            <button 
              onClick={() => { playPopupClose(); onClose(); }}
              title="Close Panel"
              className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-spidey-red transition-all cursor-pointer backdrop-blur-md hidden md:block"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Iframe preview container */}
          <div className="w-full h-full relative z-10 flex items-center justify-center">
             {iframeLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050508]">
                 <SpiderWebLoader 
                   size="sm"
                   text="Establishing secure drive stream..."
                   showProgress={false}
                 />
               </div>
             )}
            
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-none"
              title="Resume Document Live Viewer"
              onLoad={() => {
                setIframeLoading(false);
                playSuccess();
              }}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
