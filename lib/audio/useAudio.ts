'use client';

import { useEffect, useCallback, useState } from 'react';
import getAudioManager, { type AudioClip, type VoiceClip } from './audioManager';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audioManager = getAudioManager();
    setIsMuted(audioManager.isSoundMuted());
  }, []);

  const play = useCallback((clip: AudioClip | VoiceClip) => {
    const audioManager = getAudioManager();
    audioManager.play(clip);
  }, []);

  const stop = useCallback((clip: AudioClip | VoiceClip) => {
    const audioManager = getAudioManager();
    audioManager.stop(clip);
  }, []);

  const stopAll = useCallback(() => {
    const audioManager = getAudioManager();
    audioManager.stopAll();
  }, []);

  const setVolume = useCallback((clip: AudioClip | VoiceClip, volume: number) => {
    const audioManager = getAudioManager();
    audioManager.setVolume(clip, volume);
  }, []);

  const toggleMute = useCallback(() => {
    const audioManager = getAudioManager();
    const newMuted = !isMuted;
    audioManager.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  return {
    play,
    stop,
    stopAll,
    setVolume,
    toggleMute,
    isMuted,
  };
}
