import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';

const MOODS = [
  { label: '平靜', emoji: '😌', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20' },
  { label: '穩定', emoji: '🧘', color: 'bg-sky-500/20 text-sky-300 border-sky-500/20' },
  { label: '喜悅', emoji: '😊', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' },
  { label: '沉思', emoji: '💭', color: 'bg-purple-500/20 text-purple-300 border-purple-500/20' },
  { label: '疲倦', emoji: '😴', color: 'bg-slate-500/20 text-slate-300 border-slate-500/20' },
];

export default function MoodBoard() {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || '匿名友',
        content: content,
        mood: selectedMood.label,
        likes: 0,
        timestamp: serverTimestamp()
      });
      setContent('');
    } catch (err) {
      handleFirestoreError(err, 'create', 'messages');
    }
  };

  const handleLike = async (msgId: string) => {
    try {
      await updateDoc(doc(db, 'messages', msgId), {
        likes: increment(1)
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="glass-card p-6">
        <h2 className="text-lg font-medium text-white mb-6 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <MessageCircle className="text-sky-400" size={20} />
            心情留言板
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Feedback</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.label}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                  selectedMood.label === mood.label 
                  ? `${mood.color} ring-1 ring-offset-1 ring-current/50 font-medium` 
                  : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'
                }`}
              >
                <span>{mood.emoji}</span>
                {mood.label}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="此刻的你有什麼想說的嗎？"
              className="w-full p-4 pr-12 bg-white/5 border border-white/10 rounded-2xl resize-none focus:ring-2 focus:ring-sky-500/20 transition-all min-h-[120px] text-white placeholder-white/20 text-sm"
              maxLength={200}
            />
            <button
              disabled={!content.trim()}
              className="absolute bottom-4 right-4 p-2.5 bg-sky-500 text-white rounded-xl disabled:opacity-20 hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 p-5 rounded-2xl group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white/90 text-sm">{msg.userName}</span>
                  {msg.mood && (
                    <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 rounded-full border border-sky-400/20 text-sky-300">
                      感到 {msg.mood}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLike(msg.id)}
                    className="flex items-center gap-1.5 text-white/20 hover:text-rose-400 transition-colors"
                  >
                    <Heart size={14} className={msg.likes > 0 ? "fill-rose-400 text-rose-400" : ""} />
                    <span className="text-[10px] font-bold">{msg.likes || 0}</span>
                  </button>
                  <span className="text-[9px] text-white/20 uppercase tracking-wider">
                    {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{msg.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && <div className="text-center text-white/20 text-xs animate-pulse py-8">載入星空訊息中...</div>}
        {!loading && messages.length === 0 && (
          <div className="text-center py-20 text-white/10 font-light italic">
            尚未有訊息留下，成為這片星空的第一道光。
          </div>
        )}
      </div>
    </div>
  );
}
