# Integration Guide: Audio + Animations — Phase 6

This guide explains how to integrate Howler.js audio and Framer Motion animations into game components.

---

## Audio Integration

### 1. Import the useAudio Hook

```tsx
import { useAudio } from '@/lib/audio/useAudio';

export function MyGameComponent(props: GameProps) {
  const { play, setMuted, isMuted } = useAudio();

  // Play sound on correct answer
  const handleCorrectAnswer = async () => {
    play('game-correct');
    const result = await props.submit({ answer: 'correcta' });
    if (result.correct) {
      play('evidence-unlock');
    }
  };

  return (
    <>
      <button onClick={handleCorrectAnswer}>Enviar</button>
      <button onClick={() => setMuted(!isMuted)}>
        {isMuted ? '🔇 Silenci' : '🔊 Sona'}
      </button>
    </>
  );
}
```

### 2. Audio Events in Game Flow

| Event | Sound | Notes |
|-------|-------|-------|
| Correct Answer | `game-correct` | Bell ding |
| Incorrect Answer | `game-incorrect` | Buzzer |
| Evidence Unlock | `evidence-unlock` | Unlock chime |
| Bell Ring (Sometent) | `bell-ring` | Loud bell |
| Hint Given | `bell-ding` | Soft ding |
| Game Complete | `game-correct` | Victory sound |

### 3. Required Audio Files

Create these files in `public/audio/`:

```
public/audio/
├── effects/
│   ├── bell-ding.mp3        (110ms)
│   ├── bell-ring.mp3        (500ms)
│   ├── buzzer.mp3           (200ms)
│   └── unlock.mp3           (300ms)
└── voices/
    ├── bernat/
    │   ├── bernat-act1.mp3
    │   ├── bernat-act2.mp3
    │   └── bernat-act3.mp3
    ├── mossen/
    │   └── (similar structure)
    └── emissari/
        └── (similar structure)
```

**Action:** Record voice actors and place MP3 files in directories above.

---

## Animation Integration

### 1. Import Animation Variants

```tsx
import { motion } from 'framer-motion';
import {
  fadeInVariants,
  slideUpVariants,
  scaleVariants,
  pulseVariants,
  buttonHoverVariants,
} from '@/lib/animations/useAnimations';

export function MyGameComponent() {
  return (
    <>
      {/* Fade in on load */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <h1>Bienvenido</h1>
      </motion.div>

      {/* Slide up evidence when unlocked */}
      <motion.div
        initial="hidden"
        animate={evidenceUnlocked ? 'visible' : 'hidden'}
        variants={slideUpVariants}
      >
        Evidence card
      </motion.div>

      {/* Pulsing timer when <15 min */}
      <motion.div
        animate={timeRemaining < 900 ? 'pulse' : ''}
        variants={pulseVariants}
      >
        {formatTime(timeRemaining)}
      </motion.div>

      {/* Button scale on hover */}
      <motion.button
        variants={buttonHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        Enviar Resposta
      </motion.button>
    </>
  );
}
```

### 2. Common Animation Patterns

#### Fade In (Entry Animation)
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  Content appears smoothly
</motion.div>
```

#### Slide Up (Evidence Unlock)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Pista desbloqueada
</motion.div>
```

#### Staggered Children (Multiple Items)
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={containerVariants}
>
  {evidences.map((e) => (
    <motion.div key={e.id} variants={itemVariants}>
      {e.title}
    </motion.div>
  ))}
</motion.div>
```

#### Pulsing Effect (Timer Warning)
```tsx
<motion.div
  animate={timeRemaining < 900 ? 'pulse' : ''}
  variants={pulseVariants}
>
  {timeRemaining < 900 && '⏰ Temps s'acaba!'}
</motion.div>
```

---

## Accessibility Integration

### 1. ARIA Labels for Audio Controls

```tsx
<button
  aria-label="Silenciar àudio"
  onClick={() => setMuted(!isMuted)}
>
  {isMuted ? '🔇' : '🔊'}
</button>
```

### 2. Semantic HTML for Games

```tsx
<section aria-label="Joc de la Serreta">
  <h2>Serreta de Bruixes</h2>
  
  <form onSubmit={handleSubmit}>
    <label htmlFor="answer">Resposta:</label>
    <input id="answer" type="text" required />
    <button type="submit">Enviar</button>
  </form>
</section>
```

### 3. Accessibility: Remove Animations for Reduced Motion

```tsx
// In your app/layout.tsx or global styles
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Live Region Updates

```tsx
<div aria-live="polite" aria-atomic="true">
  {feedback && `Retroacció: ${feedback}`}
</div>
```

---

## Implementation Checklist

### For Each Game Component

- [ ] Import `useAudio` hook
- [ ] Add `play()` calls on key events (correct, incorrect, unlock)
- [ ] Wrap main container with fade-in animation
- [ ] Animate evidence cards with slide-up on unlock
- [ ] Add pulsing timer when <15 minutes
- [ ] Add button hover animations
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Test with keyboard only (no mouse)
- [ ] Verify colors have sufficient contrast
- [ ] Test E2E with Playwright

### For Master Dashboard

- [ ] Add animations to team score updates
- [ ] Sound effect when hint is given
- [ ] Pulsing animation for urgent alerts
- [ ] Smooth transitions between views

---

## Example: Complete Game with Audio + Animations

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameProps } from '@/components/gameTypes';
import { useAudio } from '@/lib/audio/useAudio';
import { fadeInVariants, slideUpVariants } from '@/lib/animations/useAnimations';

export function ExampleGame(props: GameProps) {
  const { play } = useAudio();
  const [showFeedback, setShowFeedback] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) return;

    const result = await props.submit({ answer });

    if (result.correct) {
      play('game-correct');
      setShowFeedback('✓ Correcte!');
    } else {
      play('game-incorrect');
      setShowFeedback('✗ Torna-ho a intentar');
      setAnswer('');
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      className="max-w-md mx-auto p-4"
    >
      <h2 className="text-2xl font-bold mb-4">Joc de Prova</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="answer" className="block">
          Resposta:
        </label>
        <input
          id="answer"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-2 border border-amber-800 rounded"
          aria-describedby="feedback"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded min-h-12"
        >
          Enviar
        </motion.button>
      </form>

      {showFeedback && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUpVariants}
          id="feedback"
          className="mt-4 p-3 bg-amber-100 text-amber-900 rounded"
          role="status"
        >
          {showFeedback}
        </motion.div>
      )}
    </motion.section>
  );
}
```

---

## Testing Audio & Animations

### Playwright Test

```typescript
test('Game plays correct sound on success', async ({ page }) => {
  const audioSpy = await page.evaluate(() => {
    window.audioPlayedClips = [];
    const originalPlay = Howl.prototype.play;
    Howl.prototype.play = function() {
      window.audioPlayedClips?.push(this.src);
      return originalPlay.call(this);
    };
  });

  // Submit correct answer
  await page.locator('input[type="text"]').fill('correcta');
  await page.locator('button:has-text("Enviar")').click();

  // Verify sound played
  const clipsPlayed = await page.evaluate(() => window.audioPlayedClips);
  expect(clipsPlayed).toContain('bell-ding.mp3');
});
```

---

## Performance Notes

- Audio files should be <100KB each (use MP3 with 128kbps bitrate)
- Howler.js handles streaming and preloading
- Animations use GPU acceleration (transform + opacity only)
- No animation on mobile by default; enable if needed

---

## Known Limitations

- QR scanner doesn't have audio/visual feedback yet (Phase 6.1)
- Voice actors not yet recorded (placeholder MP3s needed)
- Some games still missing audio integration (will be added incrementally)

---

**Last Updated:** 2026-09-16  
**Phase:** 6 (Polish + QA)  
**Status:** ✅ Ready to Integrate
