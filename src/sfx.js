// All sounds are synthesized so we don't need audio files
let audio;

// AudioContext must be created inside a user gesture; call this from any tap/keypress handler
export function unlockAudio() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume();
  } catch {}
}

// Undertale-style text blip, [base Hz, random jitter]
export function blip([base, jitter] = [260, 30]) {
  if (!audio) return;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "square";
  osc.frequency.value = base + Math.random() * jitter;
  gain.gain.setValueAtTime(0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

// Low noise thump for the explosion
export function boom() {
  if (!audio) return;
  const t = audio.currentTime;
  const buf = audio.createBuffer(1, audio.sampleRate * 0.6, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
  const src = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  src.buffer = buf;
  filter.type = "lowpass";
  filter.frequency.value = 600;
  gain.gain.value = 0.5;
  src.connect(filter).connect(gain).connect(audio.destination);
  src.start(t);
}

// Plastic toy squeak, for the brass knuckles that turn out to be plastic
export function squeak() {
  if (!audio) return;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(1600, t + 0.08);
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.25);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}

// Music-box note: triangle + a soft octave below, `at` seconds from now; returns its oscillators
function tone(midi, at, dur) {
  if (!audio) return [];
  const t = audio.currentTime + at;
  const freq = 440 * 2 ** ((midi - 69) / 12);
  return [["triangle", freq, 0.18], ["sine", freq / 2, 0.08]].map(([type, f, vol]) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur);
    return osc;
  });
}

// "Cumpleaños feliz" (Happy Birthday, public domain), one array per sung line: [midi note, beats]
const BEAT = 0.55;
const SONG = [
  [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2]],
  [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2]],
  [[67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2]],
  [[77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3]],
];

// Schedules the whole song; returns when each line starts and the total length (seconds) and a stop()
export function playSong() {
  let at = 0.3;
  const oscs = [];
  const starts = SONG.map((phrase) => {
    const start = at;
    for (const [note, beats] of phrase) {
      oscs.push(...tone(note, at, beats * BEAT));
      at += beats * BEAT;
    }
    return start;
  });
  const stop = () => oscs.forEach((o) => o.stop());
  return { starts, length: at, stop };
}
