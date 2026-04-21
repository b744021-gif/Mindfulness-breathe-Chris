import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function GeminiEncouragement() {
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "請提供一段簡短（30字以內）的正念、呼吸或溫暖鼓勵的金句。繁體中文。請直接輸出文字即可。",
        });
        setQuote(response.text || '深呼吸，讓心慢下來。');
      } catch (err) {
        console.error(err);
        setQuote('呼吸，是靈魂的安養之所。');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
    // Refresh every minute or so? Just one time per mount is fine
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto text-center px-4 py-8"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6 border border-sky-400/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
        <Sparkles size={12} />
        今日正念語錄
      </div>
      <p className="text-2xl lg:text-3xl font-light text-white/90 leading-relaxed italic">
        {loading ? '尋找靜謐力量中...' : `「${quote}」`}
      </p>
    </motion.div>
  );
}
