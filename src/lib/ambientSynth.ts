/**
 * A soft generated score, used only until /public/audio/theme.mp3 exists,
 * so the story is never silent while the real song is being chosen.
 */
const CHORDS = [
  [220.0, 277.18, 329.63, 440.0], // A
  [185.0, 220.0, 277.18, 369.99], // F#m
  [146.83, 220.0, 293.66, 369.99], // D
  [164.81, 246.94, 329.63, 415.3], // E
];
const MELODY = [659.25, 739.99, 880.0, 987.77, 1108.73];
const CHORD_SECONDS = 9;

export interface AmbientSynth {
  setLevel: (level: number, fadeMs: number) => void;
  setMuted: (muted: boolean) => void;
  stop: () => void;
}

export function createAmbientSynth(initialLevel = 0): AmbientSynth {
  const ctx = new AudioContext();
  void ctx.resume();

  const master = ctx.createGain();
  master.gain.value = initialLevel;
  const muteGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;

  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.62;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.42;

  filter.connect(master);
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);
  master.connect(muteGain);
  muteGain.connect(ctx.destination);

  const voice = (
    freq: number,
    type: OscillatorType,
    peak: number,
    attack: number,
    hold: number,
    release: number,
    detune = 0,
  ) => {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, start + attack + hold);
    gain.gain.linearRampToValueAtTime(0, start + attack + hold + release);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(start);
    osc.stop(start + attack + hold + release + 0.1);
  };

  let chordIndex = 0;
  const playChord = () => {
    for (const freq of CHORDS[chordIndex % CHORDS.length]) {
      voice(freq, "sine", 0.09, 3, CHORD_SECONDS - 4, 5, -5);
      voice(freq, "triangle", 0.035, 3, CHORD_SECONDS - 4, 5, 6);
    }
    chordIndex += 1;
  };
  const playNote = () => {
    const freq = MELODY[Math.floor(Math.random() * MELODY.length)];
    voice(freq, "sine", 0.05, 0.02, 0.1, 2.4);
  };

  playChord();
  const chordTimer = setInterval(playChord, CHORD_SECONDS * 1000);
  const noteTimer = setInterval(() => {
    if (Math.random() < 0.65) playNote();
  }, 2300);

  return {
    setLevel(level, fadeMs) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(level, now + fadeMs / 1000);
    },
    setMuted(muted) {
      muteGain.gain.value = muted ? 0 : 1;
    },
    stop() {
      clearInterval(chordTimer);
      clearInterval(noteTimer);
      void ctx.close();
    },
  };
}
