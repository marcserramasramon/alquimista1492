# Audio Assets Guide

## Overview
This document outlines the audio system for El Traïdor de la Guixa webapp. Audio is managed via Howler.js, a robust cross-browser audio library.

## Audio Format Requirements

### General Standards
- **Format**: MP3 (primary), WAV or OGG as fallback
- **Sample Rate**: 44.1 kHz or 48 kHz recommended
- **Bit Rate**: 128–256 kbps (balance between quality and file size)
- **Channels**: Mono or Stereo

### File Naming
- Effects: `public/audio/effects/{name}.mp3`
- Voices: `public/audio/voices/{actor}/{actor}-act{1|2|3}.mp3`

## Audio Clips

### Sound Effects
Located in `public/audio/effects/`:

| Clip ID | File | Purpose | Suggested Duration |
|---------|------|---------|-------------------|
| `bell-ding` | `bell-ding.mp3` | Correct answer, achievement | 0.5–1.0s |
| `buzzer` | `buzzer.mp3` | Wrong answer, error | 0.8–1.5s |
| `bell-ring` | `bell-ring.mp3` | Attention grabber, phase transition | 1.0–2.0s |
| `unlock` | `unlock.mp3` | Evidence or feature unlocked | 0.5–1.0s |

### Voice Actors
Located in `public/audio/voices/{actor}/`:

**Supported Actors:**
- `bernat` — Narrator or character voice
- `mossen` — Religious figure or authority
- `emissari` — Mystery messenger/narrator

**Acts:**
- `*-act1.mp3` — Act 1 introduction or narrative
- `*-act2.mp3` — Act 2 narrative progression
- `*-act3.mp3` — Act 3 finale or conclusion

## Architecture

### Client-Side Audio
The audio system is **client-only** to avoid SSR issues. All audio logic is wrapped with `'use client'` directive.

**Files:**
- `lib/audio/audioManager.ts` — Howler.js wrapper, sound pool management
- `lib/audio/useAudio.ts` — React hook for audio control (`'use client'`)
- `lib/audio/howler.d.ts` — TypeScript type definitions

### Usage in Components
```typescript
'use client'

import { useAudio } from '@/lib/audio/useAudio'

export function MyComponent() {
  const { play, stop, toggleMute, isMuted } = useAudio()

  return (
    <button onClick={() => play('game-correct')}>
      Play Success Sound
    </button>
  )
}
```

**Available Methods:**
- `play(clip)` — Play a sound effect or voice clip
- `stop(clip)` — Stop a specific clip
- `stopAll()` — Stop all playing audio
- `setVolume(clip, volume)` — Set volume (0–1) for a clip
- `toggleMute()` — Mute/unmute all audio
- `isMuted` — Current mute state

## Deployment & Production

### File Distribution
- Audio files are **NOT committed to git** (see `.gitignore`)
- Files must be manually placed in `public/audio/` before build
- Vercel deployment: upload via GitHub Releases or CDN integration

### Performance Considerations
- Howler preloads sounds on initialization (see `audioManager.ts`)
- Large MP3 files (>5MB) may cause slow page loads—compress as needed
- Use `html5: true` in Howl options for broader browser support

### Troubleshooting

**Audio not playing?**
1. Verify MP3 file exists at `public/audio/{path}`
2. Check browser console for CORS or 404 errors
3. Ensure `useAudio()` hook is called in a client component (`'use client'`)
4. Test on a different browser (audio API differences)

**Build errors?**
1. If `.mp3` files are missing, Howler will attempt to load from a non-existent URL
2. No build-time error is raised; failures occur at runtime
3. Consider adding a fallback or error handler:
   ```typescript
   this.sounds.set('bell-ding', new Howl({
     src: ['/audio/effects/bell-ding.mp3'],
     volume: 0.8,
     onloaderror: (id, error) => {
       console.warn('Failed to load audio:', error)
     }
   }))
   ```

## Type Safety

The `howler.d.ts` file provides complete TypeScript support:

**AudioClip Type:**
```typescript
export type AudioClip = 'game-correct' | 'game-incorrect' | 'evidence-unlock' | 'bell-ring' | 'bell-ding' | 'buzzer'
```

**VoiceClip Type:**
```typescript
export type VoiceClip = `voice-${VoiceActor}-act${1|2|3}`
// Example: 'voice-bernat-act1', 'voice-mossen-act2', etc.
```

**HowlerOptions:**
Full TypeScript interface available for custom Howl initialization.

## Migration Notes

- Howler version: `^2.2.4`
- Browser support: IE9+, all modern browsers
- Mobile support: iOS 6+, Android 2.3+ (with fallback)
- No audio plays on iOS until user interacts with the page (browser limitation)

## Future Enhancements

- [ ] Audio analytics (track which clips are played most)
- [ ] Adjustable master volume per game phase
- [ ] Spatial audio (3D positioning for future VR features)
- [ ] Dynamic ducking (auto-reduce volume for voices during gameplay)
