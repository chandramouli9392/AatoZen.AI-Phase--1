'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function BackgroundAnimation() {
    const [particles, setParticles] = useState<any[]>([])
    const [molecules, setMolecules] = useState<any[]>([])

    useEffect(() => {
        const particleCount = 40
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * -20,
        }))
        setParticles(newParticles)

        const moleculeCount = 15
        const newMolecules = Array.from({ length: moleculeCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 60 + 40,
            duration: Math.random() * 30 + 20,
            delay: Math.random() * -30,
            rotate: Math.random() * 360,
        }))
        setMolecules(newMolecules)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020205]">
            {/* Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse-subtle" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-subtle" />

            {/* AI Molecules */}
            {molecules.map((m) => (
                <motion.div
                    key={`mol-${m.id}`}
                    className="absolute opacity-[0.05]"
                    style={{
                        width: m.size,
                        height: m.size,
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        border: '1px solid rgba(255,255,255,0.5)',
                        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%',
                    }}
                    animate={{
                        x: [0, 30, -30, 0],
                        y: [0, -50, 50, 0],
                        rotate: [m.rotate, m.rotate + 360],
                    }}
                    transition={{
                        duration: m.duration,
                        repeat: Infinity,
                        delay: m.delay,
                        ease: "easeInOut"
                    }}
                >
                    <div className="absolute top-0 left-0 w-2 h-2 bg-white/20 rounded-full" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-500/20 rounded-full" />
                    <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-purple-500/20 rounded-full" />
                </motion.div>
            ))}

            {/* Floating Particles */}
            {particles.map((p) => (
                <motion.div
                    key={`p-${p.id}`}
                    className="absolute bg-white rounded-full opacity-[0.15]"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: [0, -150, 0],
                        opacity: [0.1, 0.5, 0.1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Subtle Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
        </div>
    )
}
