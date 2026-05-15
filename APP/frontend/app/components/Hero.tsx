'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-light p-12 mb-10">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-hero-breathe"
        style={{
          background:
            'radial-gradient(ellipse at 30% 50%, rgba(251,146,60,0.1) 0%, transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(244,114,182,0.07) 0%, transparent 55%)',
        }}
      />

      {/* Vinyl record silhouette — decorative element */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none">
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-accent-orange to-accent-pink">
          {/* Groove rings */}
          <div className="absolute inset-[12px] rounded-full border border-white/30" />
          <div className="absolute inset-[16px] rounded-full border border-white/20" />
          <div className="absolute inset-[20px] rounded-full border border-white/15" />
          <div className="absolute inset-[24px] rounded-full border border-white/10" />
          <div className="absolute inset-[28px] rounded-full border border-white/8" />
          {/* Label area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-surface-darker" />
          {/* Center spindle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-6xl font-bold text-primary mb-2 tracking-tight">
            HELLO<span className="text-gradient">，</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-muted-light text-lg mb-2 max-w-md"
        >
          今天你想要如何用音乐改变世界呢
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-muted-dim text-sm mb-10"
        >
          从一个念头开始，完成一张可发布的 AI 专辑。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-4"
        >
          <Link href="/albums/new" className="btn-primary transition-all duration-200 active:scale-[0.97]">
            制作新专辑
          </Link>
          <Link href="/albums" className="btn-secondary transition-all duration-200 active:scale-[0.97]">
            回顾过往专辑
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
