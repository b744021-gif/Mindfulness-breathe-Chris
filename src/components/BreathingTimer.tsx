import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, CheckCircle2, Gift, Sparkles } from 'lucide-react';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getUserStats, processReward } from '../lib/stats';
import LiveBuddies from './LiveBuddies';

interface BreathingTimerProps {
  onComplete: (reward?: { coins: number; image?: string }) => void;
}

export default function BreathingTimer({ onComplete }: BreathingTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(360); // 6 minutes
  const [phase, setPhase] = useState<'In' | 'Hold' | 'Out' | 'Pause'>('In');
  const [phaseDuration, setPhaseDuration] = useState(4); // Duration for current phase
  const [rewardShowing, setRewardShowing] = useState<{ coins: number; image?: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);
// ... phase logic same ...
  useEffect(() => {
    if (!isActive) return;
    const sequence = [
      { name: 'In' as const, duration: 4 },
      { name: 'Hold' as const, duration: 2 },
      { name: 'Out' as const, duration: 6 },
      { name: 'Pause' as const, duration: 2 },
    ];
    let currentPhaseIndex = 0;
    let timer: NodeJS.Timeout;
    const runSequence = () => {
      const current = sequence[currentPhaseIndex];
      setPhase(current.name);
      setPhaseDuration(current.duration);
      timer = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % sequence.length;
        runSequence();
      }, current.duration * 1000);
    };
    runSequence();
    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsActive(false);
      handleFinished();
    }
  }, [timeLeft]);

  const handleFinished = async () => {
    if (!auth.currentUser) return;
    try {
      const userId = auth.currentUser.uid;
      const stats = await getUserStats(userId);
      const today = new Date().toISOString().split('T')[0];
      
      let newStreak = stats.streak;
      if (stats.lastCheckIn !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];
        
        if (stats.lastCheckIn === yestStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        
        const rewardResult = await processReward(userId, newStreak);
        if (rewardResult.coinsEarned > 0 || rewardResult.newImage) {
          setRewardShowing({ coins: rewardResult.coinsEarned, image: rewardResult.newImage });
        }
      }

      await addDoc(collection(db, 'sessions'), {
        userId,
        duration: 360,
        timestamp: serverTimestamp(),
        date: today
      });
      
      onComplete();
    } catch (e) {
      handleFirestoreError(e, 'create', 'sessions');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 lg:p-8 space-y-12">
      <div className="w-full flex justify-center">
        <LiveBuddies isActive={isActive} />
      </div>

      <div className="relative flex items-center justify-center w-72 h-72 lg:w-96 lg:h-96">
        {/* Breathing Circle */}
        <motion.div
// ... existing breathing div same ...
          animate={{
            scale: phase === 'In' ? 1.4 : phase === 'Out' ? 1 : phase === 'Hold' ? 1.4 : 1,
            opacity: phase === 'In' || phase === 'Hold' ? 0.3 : 0.1,
          }}
          transition={{
            duration: phaseDuration,
            ease: "easeInOut"
          }}
          className="absolute w-64 h-64 bg-sky-500 rounded-full blur-3xl"
        />
        
        <motion.div
// ... existing breathing inner div same ...
          animate={{
            scale: phase === 'In' ? 1.4 : phase === 'Out' ? 1 : phase === 'Hold' ? 1.4 : 1,
          }}
          transition={{
            duration: phaseDuration,
            ease: "easeInOut"
          }}
          className="relative w-64 h-64 border-2 border-white/20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-[0_0_50px_rgba(14,165,233,0.1)]"
        >
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-light text-white tracking-widest"
              >
                {isActive ? (
                  phase === 'In' ? '吸氣' :
                  phase === 'Out' ? '吐氣' :
                  phase === 'Hold' ? '屏息' : '放鬆'
                ) : '準備好嗎？'}
              </motion.div>
            </AnimatePresence>
            <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-2">
              {isActive ? (
                phase === 'In' ? 'Inhale' :
                phase === 'Out' ? 'Exhale' :
                phase === 'Hold' ? 'Hold' : 'Pause'
              ) : 'Ready'}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="text-center space-y-6">
        <div className="text-6xl font-light text-white tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-16 h-16 rounded-3xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center hover:bg-sky-500/30 transition-all shadow-lg active:scale-95"
          >
            {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          
          <button
            onClick={() => {
              setIsActive(false);
              setTimeLeft(360);
              setPhase('In');
            }}
            className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {rewardShowing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="max-w-sm w-full glass p-8 text-center space-y-6 shadow-2xl">
              <div className="mx-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 animate-bounce">
                <Gift size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-medium text-white">恭喜獲得獎勵！</h3>
                <p className="text-white/60 text-sm">由於您的堅持，今天獲得了以下回報：</p>
              </div>
              
              <div className="space-y-3">
                {rewardShowing.coins > 0 && (
                  <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-xl">
                    <Sparkles size={20} />
                    + {rewardShowing.coins} 金幣
                  </div>
                )}
                {rewardShowing.image && (
                  <div className="space-y-3">
                    <div className="text-sky-300 text-sm font-medium">✨ 解鎖神秘帥哥寫真 ✨</div>
                    <img src={rewardShowing.image} className="w-full rounded-2xl border border-white/10 shadow-lg" alt="Reward" />
                  </div>
                )}
              </div>

              <button
                onClick={() => setRewardShowing(null)}
                className="w-full py-3 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-colors"
              >
                收下這份力量
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {timeLeft === 0 && !rewardShowing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-emerald-400 font-light text-sm"
        >
          <CheckCircle2 size={18} />
          今日引導已完成
        </motion.div>
      )}
    </div>
  );
}
