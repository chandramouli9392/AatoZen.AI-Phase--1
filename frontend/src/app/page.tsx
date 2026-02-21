'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, AlertCircle, Wand2, Layers, CheckCircle2 } from 'lucide-react'
import BackgroundAnimation from '@/components/BackgroundAnimation'
import UploadSection from '@/components/UploadSection'
import MusicSelector, { MusicMode } from '@/components/MusicSelector'
import VideoPreview from '@/components/VideoPreview'
import { processVideo } from '@/lib/api'
import { cn } from '@/lib/utils'

const LOADING_STEPS = [
    "Uploading Source Material...",
    "AI Scripting & Orchestration...",
    "Synthesizing Sonic Atmosphere...",
    "Finalizing Production..."
]

export default function Home() {
    const [files, setFiles] = useState<File[]>([])
    const [prompt, setPrompt] = useState('')

    // Music State
    const [musicMode, setMusicMode] = useState<MusicMode>('none')
    const [musicPrompt, setMusicPrompt] = useState('')
    const [musicFile, setMusicFile] = useState<File | null>(null)

    // Process State
    const [loading, setLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [generationTime, setGenerationTime] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showValidationModal, setShowValidationModal] = useState(false)

    // Loading Step Simulation (Removed)

    const handleGenerate = async () => {
        // Basic Validation
        if (files.length === 0 || !prompt.trim()) {
            setError('Please upload at least one clip and provide a prompt.')
            return
        }

        // Exclusive Logic Validation
        const hasPrompt = musicPrompt.trim().length > 0
        const hasFile = musicFile !== null

        if ((musicMode === 'ai' && hasFile) || (musicMode === 'upload' && hasPrompt)) {
            setShowValidationModal(true)
            return
        }

        setLoading(true)
        setError(null)
        setVideoUrl(null)
        const startTime = Date.now()

        try {
            const blob = await processVideo(
                files,
                prompt,
                (event) => {
                    if (event.status === 'Error') {
                        setError(event.detail || 'Processing failed');
                    } else {
                        const stepIndex = LOADING_STEPS.indexOf(event.status);
                        if (stepIndex !== -1) {
                            setLoadingStep(stepIndex);
                        }
                    }
                },
                musicMode === 'ai' ? musicPrompt : undefined,
                musicMode === 'upload' ? (musicFile || undefined) : undefined
            )

            const url = window.URL.createObjectURL(blob)
            const duration = ((Date.now() - startTime) / 1000).toFixed(1)

            setVideoUrl(url)
            setGenerationTime(`${duration}s`)
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'An internal error occurred during synthesis.')
        } finally {
            setLoading(false)
        }
    }

    const resetProject = () => {
        setFiles([])
        setPrompt('')
        setMusicMode('none')
        setMusicPrompt('')
        setMusicFile(null)
        setVideoUrl(null)
        setGenerationTime(null)
        setError(null)
    }

    return (
        <main className="relative min-h-screen text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
            <BackgroundAnimation />

            {/* Validation Modal */}
            <AnimatePresence>
                {showValidationModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowValidationModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative glass-card p-8 max-w-md w-full text-center space-y-6 border-red-500/20"
                        >
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black">Conflict Detected</h3>
                                <p className="text-white/60">Please select only one music option: either AI Music or Upload MP3.</p>
                            </div>
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold"
                            >
                                I'll Fix It
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 max-w-7xl">
                {/* Header Section */}
                <header className="text-center mb-16 md:mb-24 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-6 py-2 glass bg-indigo-500/5 border-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold tracking-wide uppercase"
                    >
                        <Wand2 size={14} className="animate-pulse" />
                        <span>Next-Gen Video Synthesis</span>
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20"
                        >
                            AatoZen.AI
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-indigo-200/40 font-light italic"
                        >
                            "Where AI Meets Effortless Editing"
                        </motion.p>
                    </div>
                </header>

                <div className="space-y-12">
                    {videoUrl ? (
                        <VideoPreview
                            videoUrl={videoUrl}
                            onReset={resetProject}
                            generationTime={generationTime || undefined}
                        />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Form (7/12) */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-7 space-y-8"
                            >
                                <div className="glass-card p-8 md:p-12 space-y-12 border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

                                    {/* Component 1: Video Upload */}
                                    <UploadSection
                                        files={files}
                                        setFiles={setFiles}
                                        title="Source Clips"
                                        subtitle="Upload videos for orchestration"
                                    />

                                    {/* Component 2: Editing Prompt */}
                                    <section className="space-y-4">
                                        <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-indigo-400">
                                            <Layers size={14} />
                                            <span>Creative Direction</span>
                                        </label>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Example: Merge all clips into a cinematic travel vlog. Use fast cuts and professional transitions."
                                            className="glass-input h-32"
                                        />
                                    </section>

                                    {/* Component 3: Music Selector */}
                                    <section className="space-y-4 pt-4 border-t border-white/5">
                                        <label className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-indigo-400">
                                            <Sparkles size={14} />
                                            <span>Sonic Atmosphere</span>
                                        </label>
                                        <MusicSelector
                                            mode={musicMode}
                                            setMode={setMusicMode}
                                            prompt={musicPrompt}
                                            setPrompt={setMusicPrompt}
                                            selectedFile={musicFile}
                                            onFileSelect={setMusicFile}
                                        />
                                    </section>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400"
                                        >
                                            <AlertCircle size={20} />
                                            <span className="text-sm font-medium">{error}</span>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full btn-primary h-20 flex items-center justify-center space-x-4 group/btn"
                                    >
                                        {loading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    <span className="font-black text-xl tracking-tight">Processing...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Sparkles size={24} className="group-hover/btn:rotate-12 transition-transform" />
                                                <span className="text-xl font-black">Orchestrate Production</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Right Column: Dynamic Status (5/12) */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-5 lg:sticky lg:top-12"
                            >
                                <div className="glass-card p-10 min-h-[400px] flex flex-col justify-center border-white/5 bg-white/[0.01]">
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-12"
                                            >
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                                                    <motion.div
                                                        className="absolute inset-0 border-4 border-t-indigo-500 rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    <div className="absolute inset-4 bg-indigo-500/10 rounded-full flex items-center justify-center">
                                                        <Sparkles className="text-indigo-400 animate-pulse" size={40} />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {LOADING_STEPS.map((step, idx) => (
                                                        <motion.div
                                                            key={step}
                                                            initial={{ opacity: 0.2, x: -10 }}
                                                            animate={{
                                                                opacity: idx === loadingStep ? 1 : idx < loadingStep ? 0.4 : 0.2,
                                                                x: idx === loadingStep ? 0 : -5,
                                                                scale: idx === loadingStep ? 1.05 : 1
                                                            }}
                                                            className="flex items-center gap-4"
                                                        >
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                                idx <= loadingStep ? "bg-indigo-500 text-white" : "bg-white/5 text-white/20"
                                                            )}>
                                                                {idx < loadingStep ? <CheckCircle2 size={12} /> : idx + 1}
                                                            </div>
                                                            <span className={cn(
                                                                "text-lg font-medium",
                                                                idx === loadingStep ? "text-white" : "text-white/20"
                                                            )}>
                                                                {step}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center space-y-8"
                                            >
                                                <div className="w-24 h-24 mx-auto glass rounded-3xl flex items-center justify-center text-indigo-500/20 group hover:text-indigo-500/40 transition-colors">
                                                    <Wand2 size={48} />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black">AI Studio</h3>
                                                    <p className="text-white/30 text-sm max-w-[200px] mx-auto">
                                                        Configure your project on the left to begin orchestration.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Floating Brand Mark */}
                <motion.div
                    className="fixed bottom-8 right-8 w-16 h-16 glass rounded-2xl flex items-center justify-center cursor-pointer border-white/10 shadow-2xl z-50 group active:scale-95 transition-all"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <Sparkles size={24} className="text-indigo-400 group-hover:text-white transition-colors" />
                </motion.div>
            </div>

            <footer className="relative z-10 py-12 text-center border-t border-white/5 mt-24">
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/10 uppercase">
                    © 2026 AatoZen.AI — The Future of Automated Cinema
                </p>
            </footer>
        </main>
    )
}
