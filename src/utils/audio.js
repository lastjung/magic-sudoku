class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.enabled = true; // Default enabled, managed by UI
    // C Major Scale frequencies for more melodic stepping
    this.SCALE = [
      261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, // C4 - B4
      523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, // C5 - B5
      1046.50 // C6
    ];
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) this.init();
  }

  playNote(val) {
    if (!this.enabled) return;
    this.init();
    
    // Map value (1...) to scale index. Use octaves for larger numbers.
    const noteIndex = (val - 1) % this.SCALE.length;
    const octaveShift = Math.floor((val - 1) / this.SCALE.length);
    let frequency = this.SCALE[noteIndex];
    
    // Slight detune for realism or octave shift
    if (octaveShift > 0) {
        frequency *= Math.pow(2, 0.5 * octaveShift); // Increase pitch gradually for higher squares
    }

    const now = this.audioContext.currentTime;
    
    // Main Oscillator (Triangle for body)
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);

    // Sub Oscillator (Sine for warmth)
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency, now);
    
    // Gain (Volume Envelope)
    const gainNode = this.audioContext.createGain();
    
    // Mix oscillators
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Piano-like Envelope: Quick Attack -> Decay -> Sustain (short) -> Release
    const volume = 0.15;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02); // Attack
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.1, now + 1.2); // Decay to Release
    gainNode.gain.linearRampToValueAtTime(0, now + 1.5); // End

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();

    // Play a shiny C Major 9th Arpeggio
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
    const now = this.audioContext.currentTime;

    chord.forEach((freq, i) => {
        const time = now + i * 0.08; // Staggered entry
        
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0); // Long decay
        
        osc.start(time);
        osc.stop(time + 2.0);
    });
  }
}

export const audioEngine = new AudioEngine();
