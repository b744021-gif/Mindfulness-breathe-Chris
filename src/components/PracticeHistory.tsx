import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format, subDays, isSameDay } from 'date-fns';

export default function PracticeHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', auth.currentUser?.uid),
          orderBy('date', 'desc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map(doc => doc.data().date);
        setHistory(dates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const last7Days = [...Array(14)].map((_, i) => subDays(new Date(), i)).reverse();

  return (
    <div className="glass-card p-6 border border-white/5">
      <h3 className="text-sm font-medium text-white/80 mb-6 flex items-center gap-2">
        <Calendar size={16} className="text-sky-400" />
        打卡進度
      </h3>

      <div className="grid grid-cols-7 gap-3">
        {last7Days.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isDone = history.includes(dateStr);
          const isToday = isSameDay(date, new Date());

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isDone 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                  : isToday 
                    ? 'bg-white/5 text-sky-300 border border-sky-500/40'
                    : 'bg-white/5 text-white/10 border border-white/5'
                }`}
              >
                {isDone ? '✓' : ''}
              </div>
              <span className={`text-[9px] font-medium uppercase tracking-tighter ${isToday ? 'text-sky-300' : 'text-white/20'}`}>
                {isToday ? 'Today' : format(date, 'E')}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="text-xs text-white/40">
          連續練習天數：<span className="text-sky-300 font-bold ml-1">{history.length}</span>
        </div>
        <div className="text-[10px] text-white/20 italic">
          Keep Focus
        </div>
      </div>
    </div>
  );
}
