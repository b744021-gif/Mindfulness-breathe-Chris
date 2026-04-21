import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { GoogleGenAI } from '@google/genai';

export interface UserStats {
  userId: string;
  streak: number;
  coins: number;
  lastCheckIn: string | null; // yyyy-MM-dd
  unlockedImages: string[];
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const snapDoc = await getDoc(doc(db, 'userStats', userId));
  if (snapDoc.exists()) {
    return snapDoc.data() as UserStats;
  } else {
    const initial: UserStats = {
      userId,
      streak: 0,
      coins: 0,
      lastCheckIn: null,
      unlockedImages: []
    };
    await setDoc(doc(db, 'userStats', userId), initial);
    return initial;
  }
}

export async function processReward(userId: string, newStreak: number): Promise<{ coinsEarned: number; newImage?: string }> {
  let coinsEarned = 0;
  let newImage = '';

  // Principle: 10 coins every 5 days
  if (newStreak % 5 === 0) {
    coinsEarned += 10;
  }

  // 30 days bonus: 100 coins
  if (newStreak === 30) {
    coinsEarned += 100;
  }

  // 10 days: Handsome guy photo
  if (newStreak === 10) {
    newImage = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500";
  }

  // 15 days: Photo with companion
  if (newStreak === 15) {
    newImage = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500";
  }

  const updates: any = {
    coins: increment(coinsEarned),
    streak: newStreak,
    lastCheckIn: new Date().toISOString().split('T')[0]
  };

  if (newImage) {
    updates.unlockedImages = arrayUnion(newImage);
  }

  await updateDoc(doc(db, 'userStats', userId), updates);

  return { coinsEarned, newImage };
}

async function generateRewardImage(prompt: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (err) {
    console.error("Image generation failed:", err);
    return '';
  }
}
