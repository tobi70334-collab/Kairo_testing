// Audio system for KAIRO Lite v2
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async loadSound(name: string, frequency: number, duration: number = 0.2): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a simple tone
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    }

    this.sounds.set(name, buffer);
  }

  async playSound(name: string, volume: number = 0.5): Promise<void> {
    if (!this.isEnabled || !this.audioContext || !this.sounds.has(name)) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.get(name)!;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  // Predefined sound effects
  async initializeSounds(): Promise<void> {
    await this.loadSound('success', 800, 0.3);
    await this.loadSound('error', 300, 0.4);
    await this.loadSound('warning', 600, 0.2);
    await this.loadSound('click', 1000, 0.1);
    await this.loadSound('timer', 400, 0.1);
    await this.loadSound('badge', 1200, 0.5);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

// Sound effect functions
export const playSuccessSound = () => AudioManager.getInstance().playSound('success', 0.6);
export const playErrorSound = () => AudioManager.getInstance().playSound('error', 0.7);
export const playWarningSound = () => AudioManager.getInstance().playSound('warning', 0.5);
export const playClickSound = () => AudioManager.getInstance().playSound('click', 0.3);
export const playTimerSound = () => AudioManager.getInstance().playSound('timer', 0.4);
export const playBadgeSound = () => AudioManager.getInstance().playSound('badge', 0.8);
