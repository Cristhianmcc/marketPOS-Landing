/* Sonido sintetizado con Web Audio: pitido del lector y zumbido de la ticketera.
   Solo suena después de que la persona toca algo. */
let ctx = null, on = true;

function ac(){
  if (!on) return null;
  try { ctx ??= new AudioContext(); } catch { return null; }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSound(v){ on = v; }
export const soundOn = () => on;

export function beep(freq = 1850, dur = .09){
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  o.type = 'square'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .005); g.gain.setValueAtTime(.05, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .02);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .03);
}

export function printSound(dur = 2.6){
  const a = ac(); if (!a) return;
  const t = a.currentTime, len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  // ruido modulado por pasos: el motor del cabezal térmico avanzando línea a línea
  for (let i = 0; i < len; i++){ const step = (i / a.sampleRate * 38) % 1; d[i] = (Math.random() * 2 - 1) * (step < .55 ? 1 : .25); }
  const src = a.createBufferSource(); src.buffer = buf;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 1.2;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.035, t + .05); g.gain.setValueAtTime(.035, t + dur - .1); g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(bp).connect(g).connect(a.destination); src.start(t);
}
