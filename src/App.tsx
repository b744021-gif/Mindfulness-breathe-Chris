import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, signIn, logOut, onAuthStateChanged } from './lib/firebase';
import BreathingTimer from './components/BreathingTimer';
import MoodBoard from './components/MoodBoard';
import PracticeHistory from './components/PracticeHistory';
import GeminiEncouragement from './components/GeminiEncouragement';
import RewardsPanel from './components/RewardsPanel';
import { LogIn, LogOut, Wind, Heart, History, Gift, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'breathe' | 'board' | 'history' | 'rewards'>('breathe');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-pulse text-sky-400">
          <Wind size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30 selection:text-white">
      <div className="mesh-bg" />

      <header className="relative z-20 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Wind size={24} />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-white">每日正念</h1>
            <p className="text-[9px] text-sky-400 uppercase tracking-[0.2em] font-bold">Daily Focus</p>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-white">{user.displayName}</p>
              <p className="text-[10px] text-white/40">已登入</p>
            </div>
            <button
              onClick={logOut}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
              title="登出"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="flex items-center gap-2 px-6 py-2 bg-sky-500 text-white rounded-xl font-medium shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
          >
            <LogIn size={18} />
            開始
          </button>
        )}
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {!user ? (
          <div className="max-w-xl mx-auto text-center space-y-12 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-5xl lg:text-6xl font-light text-white leading-tight">
                每天六分鐘，<br />找回屬於你的<span className="text-sky-400">平靜</span>。
              </h2>
              <p className="text-lg text-white/60 max-w-md mx-auto">
                專為繁忙現代人設計的正念空間。
              </p>
            </motion.div>
            
            <GeminiEncouragement />
            
            <div className="grid grid-cols-3 gap-6 text-center max-w-lg mx-auto">
              {[
                { icon: Wind, label: '冥想引導' },
                { icon: History, label: '數據記錄' },
                { icon: Heart, label: '心情留言' }
              ].map((item, i) => (
                <div key={i} className="p-6 glass-card">
                  <item.icon className="mx-auto mb-3 text-sky-400" size={28} />
                  <p className="text-xs text-white/70 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Navigation / Info Sidebar */}
            <aside className="w-full lg:w-64 flex flex-col gap-6 sticky top-24">
              <div className="glass p-6 flex flex-col items-center">
                <div className="text-center w-full">
                  <div className="text-3xl font-light text-white mb-1">06:00</div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest">今日目標時長</div>
                </div>
                <div className="w-full h-px bg-white/10 my-6" />
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
                <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">系統公告</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-500/80 text-[10px] font-bold">
                    <Sparkles size={12} />
                    連續獎勵已上線
                  </div>
                  <p className="text-white/40 text-[10px] leading-relaxed">
                    連續打卡 5 天送 10 金幣，10 天解鎖神秘帥哥，30 天大獎 100 金幣！
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
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
                    
                    <div className="absolute bottom-8 right-8 text-white/5 font-serif text-8xl select-none pointer-events-none uppercase tracking-widest opacity-20">
                      Focus
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-12 text-center text-white/20 text-[10px] border-t border-white/5 mt-12">
        <p className="tracking-widest uppercase">© 2026 每日正念 · MINDFUL 6</p>
      </footer>
    </div>
  );
}
