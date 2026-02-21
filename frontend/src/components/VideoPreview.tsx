'use client'

import { motion } from 'framer-motion'
import { Download, RefreshCcw, Film, Clock } from 'lucide-react'

interface VideoPreviewProps {
    videoUrl: string
    onReset: () => void
    generationTime?: string
}

export default function VideoPreview({ videoUrl, onReset, generationTime }: VideoPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
            <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video rounded-3xl overflow-hidden glass shadow-2xl border border-white/20 group">
                    <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        autoPlay
                    />
                </div>
                {generationTime && (
                    <div className="flex items-center gap-2 text-indigo-300/60 text-sm ml-2">
                        <Clock size={14} />
                        Orchestrated in {generationTime}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="glass p-6 space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-white">Production Result</h3>
                        <p className="text-white/40 text-sm mt-1">High-fidelity export ready for download.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <a
                            href={videoUrl}
                            download="aatozen-final.mp4"
                            className="btn-primary flex items-center justify-center space-x-3 text-lg"
                        >
                            <Download size={24} />
                            <span>Download Final</span>
                        </a>

                        <button
                            onClick={onReset}
                            className="w-full h-16 glass hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-3 font-medium active:scale-[0.98]"
                        >
                            <RefreshCcw size={20} />
                            New Project
                        </button>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start space-x-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Film size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-white/90 font-bold text-base">Cinema Grade</h4>
                        <p className="text-white/40 text-sm">Processed with 10-bit color accuracy and lossless audio.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
