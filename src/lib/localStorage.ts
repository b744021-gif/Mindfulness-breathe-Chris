import { useState, useEffect } from 'react';

// Simplified local storage helpers for a demo version
export const getLocalSessions = () => JSON.parse(localStorage.getItem('sessions') || '[]');
export const saveLocalSession = (date: string) => {
  const sessions = getLocalSessions();
  if (!sessions.includes(date)) {
    sessions.push(date);
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }
  return sessions;
};

export const getLocalStats = () => {
  const defaults = { streak: 0, coins: 0, lastCheckIn: null, unlockedImages: [] };
  const saved = localStorage.getItem('userStats');
  return saved ? JSON.parse(saved) : defaults;
};

export const saveLocalStats = (stats: any) => {
  localStorage.setItem('userStats', JSON.stringify(stats));
};

export const getLocalMessages = () => JSON.parse(localStorage.getItem('messages') || '[]');
export const saveLocalMessage = (msg: any) => {
  const msgs = getLocalMessages();
  msgs.unshift({ ...msg, id: Date.now().toString(), timestamp: new Date() });
  localStorage.setItem('messages', JSON.stringify(msgs.slice(0, 50)));
  return msgs;
};
