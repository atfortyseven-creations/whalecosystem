/**
 * Legendary Whale Audio Engine
 * Uses Web Audio API to generate procedural sonar/pulse sounds.
 * No external assets required. Handles browser autoplay policy gracefully.
 */

class WhaleAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  // Shockwave State
  private isShockActive: boolean = false;
  private shockOsc: OscillatorNode | null = null;
  private shockGain: GainNode | null = null;

  private async getCtx(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    // Resume suspended context (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch (e) {}
    }
    return this.ctx;
  }

  public async setMute(mute: boolean) {
    this.isMuted = mute;
    const ctx = await this.getCtx();
    if (this.masterGain && ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.3, ctx.currentTime, 0.1);
    }
  }

  /**
   * Toggles the high-frequency tension alarm for the Liquidity Stress Test.
   */
  public async setShockMode(active: boolean) {
    this.isShockActive = active;
    if (this.isMuted) return;
    const ctx = await this.getCtx();
    if (!ctx || !this.masterGain) return;

    if (active) {
      // Synthesize intense alarm
      if (!this.shockOsc) {
        this.shockOsc = ctx.createOscillator();
        this.shockOsc.type = 'sawtooth';
        this.shockOsc.frequency.value = 1400; // high pitch

        this.shockGain = ctx.createGain();
        this.shockGain.gain.value = 0;

        // LFO for fast pulse effect
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 8;
        
        const lfoAmp = ctx.createGain();
        lfoAmp.gain.value = 500;
        lfo.connect(lfoAmp);
        lfoAmp.connect(this.shockOsc.frequency);

        this.shockOsc.connect(this.shockGain);
        this.shockGain.connect(this.masterGain);

        this.shockOsc.start();
        lfo.start();
      }
      this.shockGain!.gain.setTargetAtTime(0.05, ctx.currentTime, 0.5);
    } else {
      if (this.shockGain) {
        this.shockGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      }
    }
  }

  /**
   * Plays a deep, resonant "Whale Sonar" pulse.
   * Perfect for massive transactions.
   */
  public async playWhaleSonar(intensity: number = 1) {
    if (this.isMuted) return;
    const ctx = await this.getCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // 1. Deep Sub Pulse (The "Whale Body")
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();

    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 2);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.6 * intensity, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    sub.connect(subGain);
    subGain.connect(this.masterGain);

    // 2. Resonant Sonar Ping (The "Sonar Echo")
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    ping.type = 'sine';
    ping.frequency.setValueAtTime(800, now + 0.05);
    ping.frequency.exponentialRampToValueAtTime(600, now + 0.5);

    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 10;

    pingGain.gain.setValueAtTime(0, now + 0.05);
    pingGain.gain.linearRampToValueAtTime(0.2 * intensity, now + 0.1);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    ping.connect(filter);
    filter.connect(pingGain);
    pingGain.connect(this.masterGain);

    sub.start(now);
    sub.stop(now + 3);
    ping.start(now + 0.05);
    ping.stop(now + 2);
  }

  /**
   * Play a subtle "blip" for smaller but notable transactions.
   * Also used to unlock the AudioContext on first user interaction.
   */
  public async playSubtleBlip() {
    if (this.isMuted) return;
    const ctx = await this.getCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

// Singleton – only created client-side
export const whaleAudio = typeof window !== 'undefined' ? new WhaleAudioEngine() : null;

