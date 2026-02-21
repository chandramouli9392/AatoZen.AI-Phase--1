'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Music, Upload, Sparkles, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MusicMode = 'none' | 'ai' | 'upload'

interface MusicSelectorProps {
    mode: MusicMode
    setMode: (mode: MusicMode) => void
    prompt: string
    setPrompt: (prompt: string) => void
    onFileSelect: (file: File | null) => void
    selectedFile: File | null
}

export default function MusicSelector({
    mode,
    setMode,
    prompt,
    setPrompt,
    onFileSelect,
    selectedFile
}: MusicSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
                {[
                    { id: 'none', label: 'No Music', icon: Ban },
                    { id: 'ai', label: 'Generate AI Music', icon: Sparkles },
                    { id: 'upload', label: 'Upload MP3', icon: Upload }
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setMode(option.id as MusicMode)}
                        className={cn(
                            "flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300",
                            mode === option.id
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <option.icon size={18} />
                        <span className="font-medium">{option.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {mode === 'ai' && (
                    <motion.div
                        key="ai-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        <label className="text-sm font-medium text-indigo-300/80 ml-1 flex items-center gap-2">
                            <Music size={14} />
                            Music Atmosphere
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the mood, genre, or vibe (e.g., 'Lo-Fi hip hop for coding', 'Epic cinematic drums')"
                            className="glass-input min-h-[100px]"
                        />
                    </motion.div>
                )}

                {mode === 'upload' && (
                    <motion.div
                        key="upload-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <label className="text-sm font-medium text-indigo-300/80 ml-1 flex items-center gap-2">
                            <Upload size={14} />
                            Upload MP3
                        </label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".mp3,audio/mpeg"
                                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={cn(
                                "glass p-6 flex flex-col items-center justify-center space-y-2 border-dashed border-2 transition-all",
                                selectedFile ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/10 group-hover:border-white/20"
                            )}>
                                {selectedFile ? (
                                    <>
                                        <Music className="text-indigo-400" size={32} />
                                        <span className="text-white font-medium">{selectedFile.name}</span>
                                        <span className="text-white/40 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="text-white/20 group-hover:text-white/40 transition-colors" size={32} />
                                        <span className="text-white/60">Click or drag MP3 here</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
