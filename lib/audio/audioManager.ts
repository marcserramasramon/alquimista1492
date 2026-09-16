import { Howl } from 'howler';

export type AudioClip = 'game-correct' | 'game-incorrect' | 'evidence-unlock' | 'bell-ring' | 'bell-ding' | 'buzzer';
export type VoiceActor = 'bernat' | 'mossen' | 'emissari';
export type VoiceClip = `voice-${VoiceActor}-act1` | `voice-${VoiceActor}-act2` | `voice-${VoiceActor}-act3`;

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private isMuted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Sound effects
    this.sounds.set('game-correct', new Howl({
      src: ['/audio/effects/bell-ding.mp3'],
      volume: 0.8,
    }));

    this.sounds.set('game-incorrect', new Howl({
      src: ['/audio/effects/buzzer.mp3'],
      volume: 0.8,
    }));

    this.sounds.set('evidence-unlock', new Howl({
      src: ['/audio/effects/unlock.mp3'],
      volume: 0.7,
    }));

    this.sounds.set('bell-ring', new Howl({
      src: ['/audio/effects/bell-ring.mp3'],
      volume: 0.9,
    }));

    this.sounds.set('bell-ding', new Howl({
      src: ['/audio/effects/bell-ding.mp3'],
      volume: 0.8,
    }));

    this.sounds.set('buzzer', new Howl({
      src: ['/audio/effects/buzzer.mp3'],
      volume: 0.8,
    }));

    // Voice actors
    ['bernat', 'mossen', 'emissari'].forEach((actor) => {
      for (let act = 1; act <= 3; act++) {
        const key = `voice-${actor}-act${act}`;
        this.sounds.set(key, new Howl({
          src: [`/audio/voices/${actor}/${actor}-act${act}.mp3`],
          volume: 0.9,
        }));
      }
    });
  }

  play(clip: AudioClip | VoiceClip) {
    if (this.isMuted) return;

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
