"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLoginTransition } from './LoginTransition.jsx';
import SpiderWebLoader from './SpiderWebLoader.jsx';
import { playPopupClose } from '@/utils/audio';
import { 
  X, Minus, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, List, 
  ListOrdered, Link as LinkIcon, Smile, Paperclip, 
  Trash2, HardDrive, Type, Palette, MoreHorizontal,
  ChevronUp, Maximize2
} from 'lucide-react';

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🧐','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','🥺','😢','😭',
  '😤','😠','😡','🤬','🤯','😳','😱','😨','😰','😥','😓','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄'
];

const COLORS = [
  { name: 'Red', hex: '#E50914' },
  { name: 'Blue', hex: '#00A8FF' },
  { name: 'Green', hex: '#2ECC71' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Purple', hex: '#9B59B6' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#888888' },
  { name: 'Zinc 400', hex: '#A1A1AA' }
];

export default function ComposeModal({ currentUser, onClose, onSend }) {
  const { navigateToLogin } = useLoginTransition();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // Form fields
  const [subject, setSubject] = useState('');
  const [files, setFiles] = useState([]);
  const [charCount, setCharCount] = useState(0);
  
  // Link insert fields
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');

  // Validations
  const [subjectError, setSubjectError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  
  const [sendingStatus, setSendingStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedRangeRef = useRef(null);

  // Selection range helpers
  const saveSelection = () => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range;
        }
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current && window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  // Keyboard shortcut handlers (Ctrl+B, Ctrl+I, Ctrl+U)
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        execCmd('bold');
      } else if (key === 'i') {
        e.preventDefault();
        execCmd('italic');
      } else if (key === 'u') {
        e.preventDefault();
        execCmd('underline');
      }
    }
  };

  const handleClose = () => {
    const editorText = editorRef.current ? editorRef.current.innerText.trim() : '';
    if (subject.trim() || editorText || files.length > 0) {
      if (confirm('Are you sure you want to discard this draft?')) {
        playPopupClose();
        onClose();
      }
    } else {
      playPopupClose();
      onClose();
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'png', 'zip'];
    let currentTotalSize = files.reduce((sum, f) => sum + f.size, 0);
    
    const validSelected = [];
    let sizeLimitExceeded = false;
    let typeInvalid = false;

    for (const file of selected) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(ext)) {
        typeInvalid = true;
        continue;
      }
      if (currentTotalSize + file.size > 10 * 1024 * 1024) { // 10MB total
        sizeLimitExceeded = true;
        continue;
      }
      currentTotalSize += file.size;
      validSelected.push(file);
    }

    if (typeInvalid) alert('Only PDF, DOC, DOCX, JPG, PNG, and ZIP files are allowed.');
    if (sizeLimitExceeded) alert('Total attachment size exceeds the 10MB limit.');
    
    if (validSelected.length > 0) {
      setFiles(prev => [...prev, ...validSelected]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const execCmd = (cmd, val = null) => {
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, val);
    }
    saveSelection();
  };

  const insertEmoji = (emoji) => {
    editorRef.current.focus();
    restoreSelection();
    
    let sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      let range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        editorRef.current.innerHTML += emoji;
      }
    } else {
      editorRef.current.innerHTML += emoji;
    }
    
    saveSelection();
    setShowEmojiPicker(false);
  };

  const insertLink = (e) => {
    e.preventDefault();
    if (!linkUrl || !linkUrl.trim()) return;

    editorRef.current.focus();
    restoreSelection();
    
    const sel = window.getSelection();
    const selectedText = sel.toString().trim();

    if (selectedText) {
      document.execCommand('createLink', false, linkUrl);
    } else {
      const displayVal = linkText.trim() || linkUrl;
      const anchorHtml = `<a href="${linkUrl}" target="_blank" style="color: #00A8FF; text-decoration: underline;">${displayVal}</a>&nbsp;`;
      document.execCommand('insertHTML', false, anchorHtml);
    }
    
    setLinkText('');
    setLinkUrl('https://');
    setShowLinkModal(false);
    saveSelection();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setCharCount(editorRef.current.innerText.length);
      const text = editorRef.current.innerText.trim();
      if (text) setMessageError(false);
    }
  };

  const handleSendSubmit = async () => {
    setSendingStatus('sending');
    setIsSending(true);
    try {
      const htmlBody = editorRef.current ? editorRef.current.innerHTML : '';
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', htmlBody);
      formData.append('senderEmail', currentUser?.email || 'guest@maxpf.local');
      files.forEach((file) => {
        formData.append('files', file);
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/contact/send`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendingStatus('success');
        setTimeout(() => {
          setSendingStatus(null);
          setIsSending(false);
          onClose(); // Done, close and clear
        }, 2000);
      } else {
        alert(data.message || 'Transmitter encountered an error.');
        setSendingStatus('failed');
        setIsSending(false);
      }
    } catch (err) {
      console.warn('[Contact] Error sending message:', err.message || err);
      alert('Transmission failed. Server is currently unreachable.');
      setSendingStatus('failed');
      setIsSending(false);
    }
  };

  const handleSend = () => {
    if (isSending) return;

    let hasErr = false;
    
    if (!subject.trim()) {
      setSubjectError(true);
      hasErr = true;
    } else {
      setSubjectError(false);
    }

    const editorText = editorRef.current ? editorRef.current.innerText.trim() : '';
    if (!editorText) {
      setMessageError(true);
      hasErr = true;
    } else {
      setMessageError(false);
    }

    if (hasErr) return;

    handleSendSubmit();
  };

  const senderEmail = currentUser?.email || 'guest@maxpf.local';

  // Authentication check for guest users
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
        <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

        <div className="relative w-[85vw] max-w-[450px] bg-[#0a0a0f] border border-zinc-850 shadow-[0_0_50px_rgba(229,9,20,0.2)] rounded-3xl overflow-hidden z-10 p-8 font-mono select-none flex flex-col items-center justify-center text-center space-y-6">
          <div className="absolute inset-0 comic-grid opacity-30 pointer-events-none" />

          {/* Access Locked Padlock SVG */}
          <div className="w-14 h-14 rounded-full bg-spidey-red/10 border border-spidey-red/35 flex items-center justify-center text-spidey-red animate-pulse shadow-[0_0_15px_rgba(229,9,20,0.2)] z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div className="z-10">
            <h2 className="text-xs font-bold text-spidey-red tracking-widest uppercase">
              // ACCESS_DENIED : AUTHENTICATION_REQUIRED
            </h2>
            <p className="text-zinc-400 text-[10px] mt-2 font-mono uppercase">
              Login to send a direct transmission
            </p>
          </div>

          <div className="flex gap-4 w-full justify-center pt-2 z-10">
            <button
              onClick={navigateToLogin}
              className="px-6 py-2.5 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold rounded text-[9px] tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(229,9,20,0.3)] hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
            >
              LOGIN
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-450 hover:text-white rounded text-[9px] tracking-wider uppercase transition-colors cursor-pointer pointer-events-auto"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Minimized rendering style matching Spidey theme
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 sm:right-12 z-[9999] pointer-events-auto w-[300px] bg-[#0a0a0f] border border-zinc-850 rounded-t-lg shadow-[0_-5px_20px_rgba(229,9,20,0.15)] flex items-center justify-between px-4 py-2.5 font-mono text-xs select-none">
        <span className="text-zinc-400 font-bold truncate">// NEW MESSAGE</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(false)}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            title="Expand"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button 
            onClick={handleClose}
            className="text-zinc-500 hover:text-spidey-red transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {sendingStatus ? (
        <div className="relative w-[75vw] max-w-[1000px] h-[75vh] max-h-[700px] pointer-events-auto bg-[#0a0a0f] border border-zinc-850 shadow-[0_0_50px_rgba(229,9,20,0.15)] flex flex-col items-center justify-center transition-all duration-300 rounded-3xl overflow-hidden z-10 p-8 font-mono select-none">
          {/* Subtle Halftone Overlay */}
          <div className="absolute inset-0 comic-grid opacity-30 pointer-events-none" />

          <div className="text-center z-10">
            {sendingStatus === 'sending' && (
              <SpiderWebLoader 
                size="md"
                text="// TRANSMITTING DATA..."
                showProgress={false}
              />
            )}

            {sendingStatus === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-6 text-green-500 text-2xl font-bold">
                  ✓
                </div>
                <span className="text-green-500 tracking-widest text-xs md:text-sm block uppercase font-bold">
                  // MESSAGE DELIVERED
                </span>
              </>
            )}

            {sendingStatus === 'failed' && (
              <>
                <div className="w-16 h-16 rounded-full border-2 border-spidey-red flex items-center justify-center mx-auto mb-6 text-spidey-red font-bold text-2xl">
                  ✕
                </div>
                <span className="text-spidey-red tracking-widest text-xs md:text-sm block uppercase font-bold mb-6 animate-pulse">
                  // TRANSMISSION FAILED
                </span>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSendSubmit}
                    className="px-6 py-2.5 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold rounded font-mono text-[10px] tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(229,9,20,0.3)] hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    RETRY TRANSMISSION
                  </button>
                  <button
                    onClick={() => {
                      setSendingStatus(null);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white rounded font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer pointer-events-auto"
                  >
                    // ABORT_MISSION
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-[75vw] max-w-[1000px] h-[75vh] max-h-[700px] pointer-events-auto bg-[#0a0a0f] border border-zinc-850 shadow-[0_0_50px_rgba(229,9,20,0.15)] flex flex-col md:flex-row transition-all duration-300 rounded-3xl overflow-hidden z-10">
        
        {/* LEFT SIDE: Metadata & Fields Panel (Width: 35%) */}
        <div className="w-full md:w-[35%] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 bg-[#08080c]/90 z-10 min-w-0">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[9px] text-spidey-red bg-spidey-red/10 border border-spidey-red/20 px-2 py-0.5 rounded uppercase tracking-wider select-none">
                // COMPOSE: NEW_MESSAGE
              </span>
              <h3 className="font-mono text-zinc-500 text-[10px] mt-2.5 uppercase tracking-widest select-none">
                CLASS: DIRECT_TRANSMISSION
              </h3>
            </div>

            <div className="space-y-4">
              {/* Transmission Metadata */}
              <div>
                <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-1.5 select-none">// TRANSMISSION_META</span>
                <div className="space-y-2 select-text">
                  <div className="font-mono text-[10px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900/60 break-all">
                    <span className="text-zinc-650 mr-1.5 font-bold">FROM:</span>{senderEmail}
                  </div>
                  <div className="font-mono text-[10px] text-emerald-400 font-bold bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900/60">
                    <span className="text-zinc-650 mr-1.5 font-normal">TO:</span>// ADMIN_NODE : SECURED ✓
                  </div>
                </div>
              </div>

              {/* Subject field */}
              <div>
                <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-1.5 select-none">// SUBJECT_LINE</span>
                <input 
                  type="text" 
                  placeholder="ENTER SUBJECT..."
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (e.target.value.trim()) setSubjectError(false);
                  }}
                  className={`w-full bg-transparent outline-none font-mono text-xs text-zinc-200 py-1.5 border-b transition-colors select-text ${
                    subjectError ? 'border-spidey-red focus:border-spidey-red' : 'border-zinc-800 focus:border-spidey-red/60'
                  }`}
                />
                {subjectError && (
                  <span className="text-[9px] text-spidey-red mt-1 block animate-pulse select-none font-bold">
                    ✕ Subject is required
                  </span>
                )}
              </div>

              {/* Attachments Section */}
              <div>
                <span className="font-mono text-[9px] text-zinc-600 block uppercase tracking-wider mb-1.5 select-none">// ATTACHMENTS</span>
                <button 
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3 py-1.5 rounded-lg font-mono text-[9px] text-zinc-400 hover:text-white transition-all cursor-pointer pointer-events-auto select-none"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>ATTACH FILES</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 select-none">
                    {files.map((file, idx) => (
                      <span key={idx} className="font-mono text-[9px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-900 flex items-center gap-1.5">
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        <button 
                          onClick={() => removeFile(idx)} 
                          className="text-zinc-600 hover:text-spidey-red cursor-pointer font-bold ml-1"
                          title="Remove file"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons (Transmit / Discard) */}
          <div className="mt-8 pt-4 border-t border-zinc-950 flex flex-col gap-2.5 select-none">
            <button 
              onClick={handleSend}
              className="w-full flex items-center justify-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white py-3 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(229,9,20,0.25)] pointer-events-auto"
            >
              <span>TRANSMIT MESSAGE</span>
            </button>
            <button 
              onClick={handleClose}
              className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer text-zinc-500 hover:text-white pointer-events-auto"
            >
              DISCARD INTERFACE
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Rich Text Editor & Formatting Panel (Width: 65%) */}
        <div className="flex flex-col flex-1 relative bg-[#07070a] h-full min-w-0 border-t md:border-t-0 md:border-l border-zinc-900/60 bg-[#07070a]/95">
          {/* Topbar Utility Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-20 select-none">
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button 
              onClick={handleClose}
              className="p-2.5 bg-black/75 hover:bg-spidey-red/20 border border-zinc-800 hover:border-spidey-red/45 rounded-xl text-zinc-400 hover:text-spidey-red transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formatting Toolbar */}
          <div className="pt-16 px-6 border-b border-zinc-900/60 pb-3 select-none flex items-center gap-1.5 flex-wrap min-w-0">
            {/* Bold/Italic/Underline */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('bold')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('italic')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('underline')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>

            <span className="w-[1px] h-4 bg-zinc-800 mx-1" />

            {/* Block formatting tag selection */}
            <select 
              onChange={(e) => {
                restoreSelection();
                execCmd('formatBlock', e.target.value);
              }}
              className="bg-zinc-950 border border-zinc-850 rounded px-1.5 py-0.5 text-[9px] text-zinc-400 outline-none hover:border-zinc-700 cursor-pointer pointer-events-auto font-mono"
              defaultValue="<p>"
            >
              <option value="<p>">Normal</option>
              <option value="<h1>">H1</option>
              <option value="<h2>">H2</option>
              <option value="<h3>">H3</option>
            </select>

            {/* ForeColor dropdown */}
            <div className="relative">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer flex items-center gap-0.5 pointer-events-auto"
                title="Text Color"
              >
                <Palette className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-zinc-950 border border-zinc-850 p-2 rounded-lg grid grid-cols-3 gap-1 shadow-lg w-28 pointer-events-auto">
                  {COLORS.map(color => (
                    <button
                      key={color.name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        execCmd('foreColor', color.hex);
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded border border-zinc-900 transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>

            <span className="w-[1px] h-4 bg-zinc-800 mx-1" />

            {/* Alignments */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('justifyLeft')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('justifyCenter')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('justifyRight')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>

            <span className="w-[1px] h-4 bg-zinc-800 mx-1" />

            {/* Lists */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('insertUnorderedList')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Unordered List"
            >
              <List className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('insertOrderedList')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Ordered List"
            >
              <ListOrdered className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>

            {/* Indent / Outdent */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('outdent')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer font-mono text-[9px] font-bold text-zinc-500 hover:text-white pointer-events-auto"
              title="Outdent"
            >
              &lt;
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('indent')} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer font-mono text-[9px] font-bold text-zinc-500 hover:text-white pointer-events-auto"
              title="Indent"
            >
              &gt;
            </button>

            <span className="w-[1px] h-4 bg-zinc-800 mx-1" />

            {/* Anchor insertion */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                restoreSelection();
                setShowLinkModal(!showLinkModal);
              }} 
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
            </button>

            {/* Emoji Selection Picker Grid */}
            <div className="relative">
              <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
                title="Insert Emoji"
              >
                <Smile className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full right-0 mt-1 z-30 bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg shadow-2xl w-48 max-h-40 overflow-y-auto grid grid-cols-5 gap-1.5 pointer-events-auto">
                  {EMOJIS.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertEmoji(emoji)}
                      className="text-base p-0.5 hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Google Drive Link alert */}
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => alert("Paste Drive link in message body")}
              className="p-1.5 hover:bg-zinc-900 hover:text-white rounded transition-colors cursor-pointer pointer-events-auto"
              title="Insert file from Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            </button>
          </div>

          {/* Main rich text editor */}
          <div className="flex-1 flex flex-col min-h-0 select-text relative">
            <style dangerouslySetInnerHTML={{__html: `
              .rich-editor:empty:before {
                content: "// BEGIN_MESSAGE_TRANSMISSION...";
                color: #52525b;
                pointer-events: none;
              }
            `}} />
            <div 
              ref={editorRef}
              contentEditable
              onInput={() => {
                handleEditorInput();
                saveSelection();
              }}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onBlur={saveSelection}
              onKeyDown={handleKeyDown}
              className={`w-full flex-1 bg-transparent p-6 outline-none overflow-y-auto text-xs font-mono text-zinc-300 rich-editor focus:ring-0 resize-none min-h-[200px] pointer-events-auto ${
                messageError ? 'border border-spidey-red rounded-lg' : ''
              }`}
              style={{ caretColor: '#E50914' }}
            />
            {messageError && (
              <span className="text-[10px] text-spidey-red px-6 pb-2 block animate-pulse select-none">
                ✕ Message body is required
              </span>
            )}
          </div>

          {/* Bottom right HUD indicator */}
          <div className="absolute bottom-3 right-4 font-mono text-[9px] text-zinc-600 tracking-wider select-none">
            STATUS: READY TO TRANSMIT // CHAR_COUNT: {charCount}
          </div>
        </div>

        {/* INLINE LINK DIALOG */}
        {showLinkModal && (
          <form 
            onSubmit={insertLink}
            className="absolute bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 bg-[#0a0a0f] border border-zinc-800 p-4 rounded-xl shadow-2xl flex flex-col space-y-3 font-mono text-xs select-text pointer-events-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2 select-none">
              <span className="font-bold text-spidey-blue-glow">// INSERT HYPERLINK</span>
              <button 
                type="button" 
                onClick={() => setShowLinkModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[9px] text-zinc-500 mb-1 select-none">Link Display Text:</label>
              <input 
                type="text" 
                placeholder="e.g. My Website" 
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full bg-[#050508] border border-zinc-800 focus:border-spidey-blue-glow rounded p-2 outline-none text-zinc-300 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[9px] text-zinc-500 mb-1 select-none">Destination URL:</label>
              <input 
                type="text" 
                placeholder="https://example.com" 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-[#050508] border border-zinc-800 focus:border-spidey-blue-glow rounded p-2 outline-none text-zinc-300 font-mono text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-1 select-none">
              <button 
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-1.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-spidey-blue to-spidey-blue-glow text-white font-bold rounded hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                Insert
              </button>
            </div>
          </form>
        )}
      </div>
      )}
    </div>
  );
}
