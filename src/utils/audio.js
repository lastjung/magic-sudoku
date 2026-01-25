class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.enabled = false;
    // C Major Pentatonic Scale (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5...)
    this.PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00];
  }

  init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  setEnabled(enabled) {
    if (enabled) this.init();
    this.enabled = enabled;
  }

  playNote(index) {
    if (!this.enabled || !this.audioContext) return;

    // Use mod 5 to pick base note, and increase octave for higher values
    const baseFreq = this.PENTATONIC[index % 5];
    const octave = Math.floor(index / 5);
    const frequency = baseFreq * Math.pow(2, octave);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Piano-like harmonics (Triangle + Sine)
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Envelope for percussive piano sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8); // Smooth decay

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.82);
  }
}

export const audioEngine = new AudioEngine();
