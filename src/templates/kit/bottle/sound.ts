/** Sea, cork and paper sounds, made in Web Audio (no files); silent until the guest turns them on. */
export function makeSound() {
  let ctx: AudioContext | null = null, master: GainNode | null = null, on = false;
  const buf = (sec: number, brown: boolean) => {
    const b = ctx!.createBuffer(1, ctx!.sampleRate * sec, ctx!.sampleRate), d = b.getChannelData(0);
    let l = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) {
        l = (l + 0.02 * w) / 1.02;
        d[i] = l * 3.5;
      } else d[i] = w;
    }
    return b;
  };
  const start = () => {
    if (ctx) return void ctx.resume();
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
    const sea = ctx.createBufferSource();
    sea.buffer = buf(6, true);
    sea.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(), lg2 = ctx.createGain();
    lfo.frequency.value = 0.11;
    lg.gain.value = 300;
    lg2.gain.value = 0.2;
    lfo.connect(lg).connect(lp.frequency);
    lfo.connect(lg2).connect(g.gain);
    sea.connect(lp).connect(g).connect(master);
    sea.start();
    lfo.start();
  };
  return {
    toggle() {
      on = !on;
      if (on) start();
      else void ctx?.suspend();
      return on;
    },
    pop() {
      if (!on || !ctx || !master) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.12);
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.2);
    },
    rustle(len: number) {
      if (!on || !ctx || !master) return;
      const t = ctx.currentTime, n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = buf(len + 0.2, false);
      hp.type = "highpass";
      hp.frequency.value = 2500;
      g.gain.setValueAtTime(0, t);
      for (let k = 0; k < len * 8; k++) g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.1, t + k / 8);
      g.gain.linearRampToValueAtTime(0, t + len);
      n.connect(hp).connect(g).connect(master);
      n.start(t);
    },
    splash() {
      if (!on || !ctx || !master) return;
      const t = ctx.currentTime, n = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = buf(0.9, false);
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(2400, t);
      lp.frequency.exponentialRampToValueAtTime(300, t + 0.7);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      n.connect(lp).connect(g).connect(master);
      n.start(t);
    },
    thud() {
      if (!on || !ctx || !master) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
      g.gain.setValueAtTime(0.8, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.32);
    },
    stop() {
      void ctx?.close();
    },
  };
}

