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
    newImage = await generateRewardImage("A very handsome, zen-like young man with short hair, wearing simple organic linen clothes, peaceful expression, soft natural lighting, high quality photography.");
  }

  // 15 days: Photo with companion
  if (newStreak === 15) {
    newImage = await generateRewardImage("A cinematic photo of a peaceful meditation scene with a handsome zen master and a shadow/silhouette representing the user, glowing light, ethereal atmosphere.");
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
