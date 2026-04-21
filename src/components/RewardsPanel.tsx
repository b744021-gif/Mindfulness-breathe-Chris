import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { getUserStats, UserStats } from '../lib/stats';
import { Coins, Image as ImageIcon, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RewardsPanel() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    getUserStats(auth.currentUser.uid).then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-6 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Coins size={24} />
          </div>
          <div>
            <div className="text-2xl font-light text-white">{stats.coins}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">獎勵金幣數量</div>
          </div>
        </div>
        
        <div className="glass p-6 flex items-center gap-4">
          <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-2xl font-light text-white">{stats.streak} <span className="text-xs text-white/40">Days</span></div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">當前連續打卡</div>
          </div>
        </div>
      </div>

      <div className="glass p-8">
        <h3 className="text-white font-medium mb-6 flex items-center gap-2">
          <ImageIcon className="text-sky-400" size={18} />
          收藏品庫 (帥哥成就)
        </h3>
        
        {stats.unlockedImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {stats.unlockedImages.map((img, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedImg(img)}
                className="aspect-square rounded-2xl overflow-hidden border border-white/10 glass-card relative group"
              >
                <img src={img} alt="Reward" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Award className="text-white" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <ImageIcon className="mx-auto text-white/10 mb-3" size={48} />
            <p className="text-white/20 text-sm italic">連續打卡 10 天起解鎖神秘帥哥照...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl w-full glass p-2 rounded-[32px] relative"
            >
              <img src={selectedImg} alt="Large reward" className="w-full rounded-[28px] shadow-2xl" referrerPolicy="no-referrer" />
              <button 
                className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-xl"
                onClick={() => setSelectedImg(null)}
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
