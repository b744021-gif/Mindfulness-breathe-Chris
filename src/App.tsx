import React, { useState, useEffect } from 'react';
import BreathingTimer from './components/BreathingTimer';
import MoodBoard from './components/MoodBoard';
import PracticeHistory from './components/PracticeHistory';
import RewardsPanel from './components/RewardsPanel';
import { Wind, Heart, History, Award, Sparkles, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'breathe' | 'board' | 'history' | 'rewards'>('breathe');
  const [isDemo, setIsDemo] = useState(true);

  // Mock user for static version
  const user = { displayName: '正念愛好者', photoURL: null };

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30 selection:text-white">
      <div className="mesh-bg" />

      <header className="relative z-20 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Wind size={24} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-white">每日正念 (體驗版)</h1>
            <p className="text-[9px] text-sky-400 uppercase tracking-[0.2em] font-bold">Static Focus</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-white">{user.displayName}</p>
            <p className="text-[10px] text-white/40">本地儲存模式</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <UserIcon size={20} />
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Navigation */}
          <aside className="w-full lg:w-64 flex flex-col gap-6 sticky top-24">
            <div className="glass p-6 flex flex-col items-center">
              <nav className="w-full flex flex-col gap-2">
                {[
                  { id: 'breathe', label: '呼吸引導', icon: Wind },
                  { id: 'board', label: '心情留言', icon: Heart },
                  { id: 'history', label: '練習記錄', icon: History },
                  { id: 'rewards', label: '我的成就', icon: Award }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id 
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="glass p-6 hidden lg:block">
              <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">系統提示</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sky-400 text-[10px] font-bold">
                  <Sparkles size={12} />
                  本地存檔已啟動
                </div>
                <p className="text-white/40 text-[10px] leading-relaxed">
                  目前為 GitHub 靜態佈署版本，您的進度將儲存在此瀏覽器中。清理快取可能會導致數據丟失。
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full h-full"
              >
                <div className="glass w-full min-h-full flex flex-col p-4 lg:p-8 relative overflow-hidden">
                  <div className="absolute top-8 left-8 text-white/5 font-serif italic text-6xl select-none pointer-events-none uppercase tracking-tighter">
                    {activeTab}
                  </div>
                  
                  <div className="relative z-10">
                    {activeTab === 'breathe' && <BreathingTimer onComplete={() => {}} />}
                    {activeTab === 'board' && <MoodBoard />}
                    {activeTab === 'history' && <PracticeHistory />}
                    {activeTab === 'rewards' && <RewardsPanel />}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-12 text-center text-white/20 text-[10px] border-t border-white/5 mt-12">
        <p className="tracking-widest uppercase">© 2026 每日正念 · github 靜態版</p>
      </footer>
    </div>
  );
}
