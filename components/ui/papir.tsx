/** Vores de papir esquinçat per a `.fitxa-papir` (globals.css): tres llavors perquè no siguin iguals. */
export function FiltresPapir() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      {[3, 11, 27].map((llavor, i) => (
        <filter key={llavor} id={`esquincat-${i}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={4} seed={llavor} result="soroll" />
          <feDisplacementMap in="SourceGraphic" in2="soroll" scale={7} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      ))}
    </svg>
  );
}

/** Cada element té sempre la mateixa vora esquinçada (una de tres) i la mateixa inclinació. */
export function estilPapir(nom: string): React.CSSProperties {
  let h = 0;
  for (const ch of nom) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return { "--esquincat": `url(#esquincat-${h % 3})`, rotate: `${(h % 11) - 5}deg` } as React.CSSProperties;
}
