'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileVideo, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadSectionProps {
    files: File[]
    setFiles: (files: File[]) => void
    title: string
    subtitle: string
    accept?: string
    multiple?: boolean
    icon?: React.ElementType
}

export default function UploadSection({
    files,
    setFiles,
    title,
    subtitle,
    accept = "video/*",
    multiple = true,
    icon: Icon = Upload
}: UploadSectionProps) {
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            if (multiple) {
                setFiles([...files, ...newFiles])
            } else {
                setFiles(newFiles)
            }
        }
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = () => {
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => {
                if (accept === "video/*") return f.type.startsWith('video/')
                if (accept.includes("audio")) return f.type.startsWith('audio/') || f.name.endsWith('.mp3')
                return true
            })
            if (multiple) {
                setFiles([...files, ...newFiles])
            } else {
                setFiles(newFiles.slice(0, 1))
            }
        }
    }

    return (
        <div className="space-y-4">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-[2rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4",
                    isDragging
                        ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
            >
                <input
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <div className="p-5 bg-indigo-500/20 rounded-2xl text-indigo-400">
                    <Icon size={32} />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-white">{title}</p>
                    <p className="text-sm text-indigo-300/40 mt-1">{subtitle}</p>
                </div>
            </div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 gap-3 overflow-hidden"
                    >
                        {files.map((file, index) => (
                            <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-between p-4 glass bg-white/5 rounded-2xl group"
                            >
                                <div className="flex items-center space-x-4 truncate">
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <FileVideo size={18} className="text-indigo-400" />
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-sm font-medium text-white/90 truncate">{file.name}</span>
                                        <span className="text-xs text-white/30">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFile(index)
                                    }}
                                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
