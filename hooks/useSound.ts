"use client";

import { useCallback } from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

type SoundType = 'whale-alert' | 'activity' | 'achievement' | 'level-up' | 'notification';

export function useSound() {
  const { audioAlerts, hapticFeedback } = useSettingsStore();

  const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
    // Respect the user's audioAlerts setting — if disabled, do nothing
    if (!audioAlerts) return;
    if (typeof Audio === 'undefined') return;

    try {
      const sounds: Record<SoundType, string> = {
        'whale-alert':  '/sounds/whale-alert.mp3',
        'activity':     '/sounds/activity.mp3',
        'achievement':  '/sounds/achievement.mp3',
        'level-up':     '/sounds/level-up.mp3',
        'notification': '/sounds/notification.mp3',
      };

      const audio = new Audio(sounds[type]);
      audio.volume = volume;
      audio.play().catch(() => {
        // Autoplay blocked by browser — silent fail
      });
    } catch {
      // Sound playback unsupported — silent fail
    }
  }, [audioAlerts]);

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    // Respect hapticFeedback setting
    if (!hapticFeedback) return;
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Not supported on this device — silent fail
    }
  }, [hapticFeedback]);

  return { playSound, vibrate };
}
