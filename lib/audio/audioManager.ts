import { Howl } from 'howler';

export type AudioClip = 'game-correct' | 'game-incorrect' | 'evidence-unlock' | 'bell-ring' | 'bell-ding' | 'buzzer';
export type VoiceActor = 'bernat' | 'mossen' | 'emissari';
export type VoiceClip = `voice-${VoiceActor}-act1` | `voice-${VoiceActor}-act2` | `voice-${VoiceActor}-act3`;

/**
 * AudioManager wraps Howler.js to provide a centralized audio control system.
 * All audio is client-only to avoid SSR issues.
 *
 * Note: Audio files must be placed in public/audio/ before deployment.
 * See docs/AUDIO.md for setup instructions.
 */
class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private isMuted: boolean = false;
  private failedLoads: Set<string> = new Set();

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Sound effects
    const soundEffects: Record<AudioClip, string> = {
      'game-correct': '/audio/effects/bell-ding.mp3',
      'game-incorrect': '/audio/effects/buzzer.mp3',
      'evidence-unlock': '/audio/effects/unlock.mp3',
      'bell-ring': '/audio/effects/bell-ring.mp3',
      'bell-ding': '/audio/effects/bell-ding.mp3',
      'buzzer': '/audio/effects/buzzer.mp3',
    };

    Object.entries(soundEffects).forEach(([key, src]) => {
      const clipKey = key as AudioClip;
      this.sounds.set(clipKey, new Howl({
        src: [src],
        volume: this.getVolumeForClip(clipKey),
        onloaderror: (id, error) => {
          this.failedLoads.add(clipKey);
          console.warn(`Failed to load audio clip "${clipKey}": ${error}`);
        },
        html5: true, // Use HTML5 Audio API for better compatibility
      }));
    });

    // Voice actors
    const voiceActors: VoiceActor[] = ['bernat', 'mossen', 'emissari'];
    voiceActors.forEach((actor) => {
      for (let act = 1; act <= 3; act++) {
        const key = `voice-${actor}-act${act}`;
        const src = `/audio/voices/${actor}/${actor}-act${act}.mp3`;
        this.sounds.set(key, new Howl({
          src: [src],
          volume: 0.9,
          onloaderror: (id, error) => {
            this.failedLoads.add(key);
            console.warn(`Failed to load voice clip "${key}": ${error}`);
          },
          html5: true,
        }));
      }
    });
  }

  private getVolumeForClip(clip: AudioClip): number {
    const volumeMap: Record<AudioClip, number> = {
      'game-correct': 0.8,
      'game-incorrect': 0.8,
      'evidence-unlock': 0.7,
      'bell-ring': 0.9,
      'bell-ding': 0.8,
      'buzzer': 0.8,
    };
    return volumeMap[clip] ?? 0.8;
  }

  play(clip: AudioClip | VoiceClip) {
    if (this.isMuted) return;
    if (this.failedLoads.has(clip)) {
      console.debug(`Skipping playback of missing audio: ${clip}`);
      return;
    }

    const sound = this.sounds.get(clip);
    if (sound) {
      sound.stop();
      sound.play();
    }
  }

  stop(clip: AudioClip | VoiceClip) {
    const sound = this.sounds.get(clip);
    if (sound) {
      sound.stop();
    }
  }

  stopAll() {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }

  setVolume(clip: AudioClip | VoiceClip, volume: number) {
    const sound = this.sounds.get(clip);
    if (sound) {
      sound.volume(Math.max(0, Math.min(1, volume)));
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  hasFailedLoads(): boolean {
    return this.failedLoads.size > 0;
  }

  getFailedLoads(): string[] {
    return Array.from(this.failedLoads);
  }
}

// Singleton instance
let audioManager: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}

export default getAudioManager;
