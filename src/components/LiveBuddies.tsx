import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Wind } from 'lucide-react';

export default function LiveBuddies({ isActive }: { isActive: boolean }) {
  const [buddies, setBuddies] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const presenceRef = doc(db, 'presence', auth.currentUser.uid);
    
    const updatePresence = async () => {
      await setDoc(presenceRef, {
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || '同行者',
        isBreathing: isActive,
        lastSeen: serverTimestamp()
      });
    };

    updatePresence();
    
    // Heartbeat
    const interval = setInterval(updatePresence, 30000); 

    return () => {
      clearInterval(interval);
      deleteDoc(presenceRef).catch(console.error);
    };
  }, [isActive]);

  useEffect(() => {
    const q = query(
      collection(db, 'presence'),
      where('isBreathing', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const live = snapshot.docs
        .map(d => d.data())
        .filter(d => d.userId !== auth.currentUser?.uid);
      setBuddies(live);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex -space-x-2">
        {buddies.slice(0, 3).map((buddy, i) => (
          <div 
            key={i} 
            className="w-8 h-8 rounded-full bg-sky-500 border-2 border-[#1e293b] flex items-center justify-center text-[10px] font-bold text-white shadow-lg overflow-hidden shrink-0"
            title={buddy.userName}
          >
            {buddy.userName.substring(0, 1)}
          </div>
        ))}
        {buddies.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#1e293b] flex items-center justify-center text-[10px] font-bold text-white/60">
            +{buddies.length - 3}
          </div>
        )}
      </div>
      
      <div className="text-xs text-white/40 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          {buddies.length > 0 ? `${buddies.length} 位同伴正同步呼吸` : '你正獨自練習'}
        </div>
      </div>
    </div>
  );
}
