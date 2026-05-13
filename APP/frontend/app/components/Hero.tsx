'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-light p-10 mb-8">
      <div
        className="absolute inset-0 opacity-30 animate-hero-breathe"
        style={{
          background:
            'radial-gradient(ellipse at 30% 50%, rgba(251,146,60,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(244,114,182,0.06) 0%, transparent 50%)',
        }}
      />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold text-white mb-2">HELLO，</h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted text-base mb-3"
        >
          今天你想要如何用音乐改变世界呢
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-muted-dim text-sm mb-8"
        >
          从一个念头开始，完成一张可发布的 AI 专辑。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex gap-3"
        >
          <Link href="/albums/new" className="btn-primary">
            制作新专辑
          </Link>
          <Link href="/albums" className="btn-secondary">
            回顾过往专辑
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
