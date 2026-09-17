declare module 'howler' {
  export interface HowlerOptions {
    src?: string | string[]
    autoplay?: boolean
    mute?: boolean
    loop?: boolean
    rate?: number
    preload?: boolean | string
    html5?: boolean
    volume?: number
    onend?: () => void
    onload?: () => void
    onloaderror?: (id: string | number, error: unknown) => void
    onplayerror?: (id: string | number) => void
    onplay?: () => void
    onpause?: () => void
    onstop?: () => void
    onfade?: () => void
    format?: string | string[]
    pool?: number
    xhr?: {
      method?: string
      headers?: Record<string, string>
      withCredentials?: boolean
    }
  }

  export class Howl {
    constructor(options: HowlerOptions)
    play(id?: string | number): string | number
    pause(id?: string | number): Howl
    stop(id?: string | number): Howl
    mute(muted?: boolean, id?: string | number): Howl | boolean
    volume(volume?: number, id?: string | number): Howl | number
    fade(from: number, to: number, duration: number, id?: string | number): Howl
    rate(rate?: number, id?: string | number): Howl | number
    seek(seek?: number, id?: string | number): Howl | number
    loop(loop?: boolean, id?: string | number): Howl | boolean
    state(): string
    playing(id?: string | number): boolean
    duration(id?: string | number): number
    load(): Howl
    unload(): Howl
    on(event: string, fn: (...args: unknown[]) => void): Howl
    once(event: string, fn: (...args: unknown[]) => void): Howl
    off(event: string, fn?: (...args: unknown[]) => void, id?: string | number): Howl
  }

  export class Howler {
    static mute(muted?: boolean): Howler | boolean
    static volume(volume?: number): Howler | number
    static stop(): Howler
    static unload(): Howler
    static codecs(ext: string): boolean
    static html5PoolSize: number
    static autoUnload: boolean
    static autoSuspend: boolean
    static ctx: AudioContext | undefined
    static master: Howl
    static noAudio: boolean
  }
}
